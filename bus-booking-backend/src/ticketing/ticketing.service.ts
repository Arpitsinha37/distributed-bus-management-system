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
      await this.notifications.sendEmail(
        booking.customerEmail,
        `Your ticket ${booking.bookingRef}`,
        `Booked: ${origin} to ${dest}`,
      );
    }
    await this.notifications.sendSms(booking.customerPhone, smsText);
    await this.notifications.sendWhatsApp(booking.customerPhone, `Ticket ${booking.bookingRef} confirmed.`);

    return ticket;
  }
}
