import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SitesModule } from './sites/sites.module';
import { StaffModule } from './staff/staff.module';
import { FleetModule } from './fleet/fleet.module';
import { RoutesModule } from './routes/routes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TripsModule } from './trips/trips.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentModule } from './payment/payment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { ReportingModule } from './reporting/reporting.module';
import { CrewModule } from './crew/crew.module';
import { CouponsModule } from './coupons/coupons.module';
import { CmsModule } from './cms/cms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // powers the @Cron() jobs: trip generation, hold expiry, payment reconciliation
    PrismaModule,
    AuthModule,
    SitesModule,
    StaffModule,
    FleetModule,
    RoutesModule,
    SchedulesModule,
    TripsModule,
    BookingsModule,
    PaymentsModule,
    PaymentModule,
    NotificationsModule,
    TicketingModule,
    ReportingModule,
    CrewModule,
    CouponsModule,
    CmsModule,
  ],
})
export class AppModule {}

