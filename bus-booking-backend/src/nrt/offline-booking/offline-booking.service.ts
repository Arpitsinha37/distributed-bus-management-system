import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateOfflineBookingDto } from './offline-booking.dto';

@Injectable()
export class OfflineBookingService {
    private readonly logger = new Logger(OfflineBookingService.name);
    private readonly frontendUrl = process.env.FRONTEND_URL || 'https://new-road-travels.vercel.app';

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) {}

    /**
     * Create an offline booking record.
     * 
     * Called by the API holder company when they process an offline/counter booking
     * through their software. This ensures the booking data reaches our database
     * and the passenger can get a ticket from our system too.
     * 
     * If the TicketNo already exists, we return the existing record (idempotent).
     */
    async createOfflineBooking(dto: CreateOfflineBookingDto) {
        // ── Step 1: Duplicate check (idempotent) ──
        const existing = await this.prisma.nrtPayment.findFirst({
            where: { ticketNo: dto.TicketNo },
        });

        if (existing) {
            this.logger.warn(`[OFFLINE] Duplicate submission for TicketNo=${dto.TicketNo}. Returning existing record.`);
            return {
                success: true,
                duplicate: true,
                message: 'This booking already exists in our system.',
                payment: existing,
                ticketUrl: `${this.frontendUrl}/ticket?ticketNo=${dto.TicketNo}`,
            };
        }

        // ── Step 2: Create Payment record ──
        this.logger.log(`[OFFLINE] Creating offline booking: TicketNo=${dto.TicketNo}, name=${dto.name}, route=${dto.route}`);

        const payment = await this.prisma.nrtPayment.create({
            data: {
                ticketNo: dto.TicketNo,
                method: 'offline',
                amount: dto.amount,
                currency: 'NPR',
                status: 'completed',
                isFinalized: true,
                finalizedAt: new Date(),
                passengerName: dto.name,
                passengerPhone: dto.contact,
                passengerEmail: dto.email || null,
                route: dto.route,
                travelDate: dto.travelDate,
                seatNumbers: dto.seatNumbers,
                transactionId: `OFFLINE-${dto.TicketNo}`,
                gatewayResponse: {
                    source: 'offline_api',
                    pickup: dto.pickup || null,
                    drop: dto.drop || null,
                    busName: dto.busName || null,
                    busNumber: dto.busNumber || null,
                    remarks: dto.remarks || null,
                    receivedAt: new Date().toISOString(),
                },
            },
        });

        this.logger.log(`[OFFLINE] ✅ Payment created: id=${payment.id}, TicketNo=${dto.TicketNo}`);

        // ── Step 3: Audit log ──
        await this.prisma.auditLog.create({
            data: {
                action: 'create',
                resource: 'offline_booking',
                resourceId: payment.id,
                details: {
                    ticketNo: dto.TicketNo,
                    passengerName: dto.name,
                    route: dto.route,
                    amount: dto.amount,
                    seatNumbers: dto.seatNumbers,
                    travelDate: dto.travelDate,
                },
            },
        }).catch((err: any) => {
            this.logger.error(`[OFFLINE] Audit log failed: ${err?.message}`);
        });

        // ── Step 4: Send emails (fire-and-forget, non-blocking) ──
        this._sendEmailsInBackground(dto, payment);

        // ── Step 5: Return response ──
        return {
            success: true,
            duplicate: false,
            message: 'Offline booking recorded successfully.',
            payment,
            ticketUrl: `${this.frontendUrl}/ticket?ticketNo=${dto.TicketNo}`,
        };
    }

    /**
     * List all offline bookings (for CMS dashboard).
     */
    async findAll(page = 1, limit = 20) {
        const where = { method: 'offline' };

        const [data, total] = await Promise.all([
            this.prisma.nrtPayment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.nrtPayment.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get a specific offline booking by ticket number.
     */
    async findByTicketNo(ticketNo: string) {
        const payment = await this.prisma.nrtPayment.findFirst({
            where: { ticketNo, method: 'offline' },
        });

        if (!payment) {
            return null;
        }

        return payment;
    }

    /**
     * Get stats for offline bookings (for dashboard widget).
     */
    async getStats() {
        const [totalBookings, totalRevenue, todayBookings] = await Promise.all([
            this.prisma.nrtPayment.count({ where: { method: 'offline' } }),
            this.prisma.nrtPayment.aggregate({
                where: { method: 'offline', status: 'completed' },
                _sum: { amount: true },
            }),
            this.prisma.nrtPayment.count({
                where: {
                    method: 'offline',
                    createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
            }),
        ]);

        return {
            totalBookings,
            totalRevenue: totalRevenue._sum.amount || 0,
            todayBookings,
        };
    }

    /**
     * Background: Send booking confirmation emails (non-blocking).
     * Same emails as online bookings — customer + admin notification.
     */
    private _sendEmailsInBackground(dto: CreateOfflineBookingDto, payment: any) {
        Promise.allSettled([
            // Customer email (only if email provided)
            ...(dto.email ? [
                this.emailService.sendBookingConfirmationCustomer(
                    dto.email,
                    dto.name,
                    dto.TicketNo,
                    dto.route,
                    dto.travelDate,
                    dto.seatNumbers,
                    dto.amount,
                    'Offline Booking'
                )
            ] : []),
            // Admin notification
            this.emailService.sendNewBookingAlertAdmin(
                dto.name,
                dto.contact,
                dto.email || '',
                dto.TicketNo,
                dto.route,
                dto.travelDate,
                dto.seatNumbers,
                dto.amount,
                'Offline Booking'
            ),
        ]).then(results => {
            for (let i = 0; i < results.length; i++) {
                if (results[i].status === 'rejected') {
                    this.logger.error(`[OFFLINE] ❌ Email ${i + 1} failed:`, (results[i] as any).reason?.message);
                } else {
                    this.logger.log(`[OFFLINE] ✅ Email ${i + 1}/${results.length} sent successfully`);
                }
            }
        });
    }
}

