import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketingService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Call this right after BookingsService.confirmBooking() succeeds.
  async issueTicket(bookingId: string) {
    const booking = await this.prisma.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: { 
        passengers: true, 
        trip: { 
          include: { 
            schedule: { include: { route: true } },
            crew: { include: { crewMember: true } },
            bus: true
          } 
        } 
      },
    });

    // plug in a QR/PDF library here (e.g. `qrcode` + `pdf-lib`, or the
    // project's own pdf skill if generating server-side)
    const qrCode = `TICKET:${booking.bookingRef}`;

    const ticket = await this.prisma.ticket.create({
      data: { bookingId, qrCode },
    });

    const driver = booking.trip?.crew?.find(c => c.role === 'DRIVER')?.crewMember;
    const helper = booking.trip?.crew?.find(c => c.role === 'HELPER')?.crewMember;
    const driverText = driver ? `\n👤 Driver: ${driver.name} (${driver.phone})` : '';
    const helperText = helper ? `\n👤 Helper: ${helper.name}` : '';

    let origin = 'N/A';
    let dest = 'N/A';
    let busReg = 'N/A';
    
    if (booking.trip?.schedule?.route) {
      origin = booking.trip.schedule.route.originCity;
      dest = booking.trip.schedule.route.destinationCity;
      busReg = booking.trip.bus?.registrationNo || 'N/A';
    } else if (booking.portalTripId) {
      try {
        const decoded = Buffer.from(booking.portalTripId, 'base64').toString('ascii');
        const [o, d, , busno] = decoded.split('|');
        origin = o;
        dest = d;
        busReg = busno || 'N/A';
      } catch (e) {}
    }

    const smsText = `🎫 NEW ROAD TRAVELS
Booking: ${booking.bookingRef}
━━━━━━━━━━━━━━━━━━
📍 ${origin} → ${dest}
🚌 Bus: ${busReg}
💺 Seats: ${booking.passengers.map(p => p.seatNumber).join(', ')}${driverText}${helperText}
━━━━━━━━━━━━━━━━━━
Show this SMS at boarding.`;

    if (booking.customerEmail) {
      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <div style="text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
              <h2 style="color: #dc2626; margin: 0 0 8px 0;">New Road Travels</h2>
              <h1 style="margin: 0; color: #1e293b; font-size: 24px;">Booking Confirmed!</h1>
              <p style="color: #64748b; margin: 8px 0 0 0;">Your ticket has been issued successfully.</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">PNR Number</td>
                <td style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; text-align: right;">Amount Paid</td>
              </tr>
              <tr>
                <td style="padding: 0 0 16px 0; font-family: monospace; font-weight: bold; font-size: 16px;">${booking.bookingRef}</td>
                <td style="padding: 0 0 16px 0; font-weight: bold; font-size: 18px; color: #16a34a; text-align: right;">रू ${booking.totalFare}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Travel Route</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 0 0 16px 0; font-weight: bold; font-size: 16px;">${origin} to ${dest}</td>
              </tr>
            </table>

            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-weight: bold; color: #0f172a;">${booking.customerName || 'Passenger'}</p>
              <p style="margin: 8px 0 0 0; color: #dc2626; font-weight: bold; font-size: 14px;">
                Seats: ${booking.passengers.map(p => p.seatNumber).join(', ')}
              </p>
            </div>
          </div>
        </div>
      `;

      await this.notifications.sendEmail(
        booking.customerEmail,
        `Your Ticket Confirmed - ${booking.bookingRef}`,
        htmlBody,
      );
    }
    await this.notifications.sendSms(booking.customerPhone, smsText);
    await this.notifications.sendWhatsApp(booking.customerPhone, `Ticket ${booking.bookingRef} confirmed.`);

    return ticket;
  }
}
