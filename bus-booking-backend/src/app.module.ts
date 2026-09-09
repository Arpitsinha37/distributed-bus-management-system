import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
import { NotificationsModule } from './notifications/notifications.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { ReportingModule } from './reporting/reporting.module';
import { CrewModule } from './crew/crew.module';
import { CouponsModule } from './coupons/coupons.module';
import { CmsModule } from './cms/cms.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

// ═══════════════════════════════════════════════════════════
// NRT CMS CONTENT MODULES
// ═══════════════════════════════════════════════════════════
import { BusServiceModule } from './nrt/bus-service/bus-service.module';
import { TourPackageModule } from './nrt/tour-package/tour-package.module';
import { VehicleRentalModule } from './nrt/vehicle-rental/vehicle-rental.module';
import { AboutModule } from './nrt/about/about.module';
import { TestimonialModule } from './nrt/testimonial/testimonial.module';
import { HeroBannerModule } from './nrt/hero-banner/hero-banner.module';
import { ContactModule } from './nrt/contact/contact.module';
import { BlogModule } from './nrt/blog/blog.module';
import { BlogAuthorModule } from './nrt/blog-author/blog-author.module';
import { FAQModule } from './nrt/faq/faq.module';
import { TeamModule } from './nrt/team/team.module';
import { AchievementModule } from './nrt/achievement/achievement.module';
import { GalleryModule } from './nrt/gallery/gallery.module';
import { SiteSettingModule } from './nrt/site-setting/site-setting.module';
import { SliderModule } from './nrt/slider/slider.module';
import { FeatureModule } from './nrt/feature/feature.module';
import { DestinationModule } from './nrt/destination/destination.module';
import { StoryModule } from './nrt/story/story.module';
import { AdventureActivityModule } from './nrt/adventure-activity/adventure-activity.module';

// NRT SUBMISSION / INQUIRY MODULES
import { EmailSubscriberModule } from './nrt/email-subscriber/email-subscriber.module';
import { BookingInquiryModule } from './nrt/booking-inquiry/booking-inquiry.module';
import { PartnerRequestModule } from './nrt/partner-request/partner-request.module';
import { ContactSubmissionModule } from './nrt/contact-submission/contact-submission.module';
import { SupportTicketModule } from './nrt/support-ticket/support-ticket.module';

// NRT CORE BUSINESS MODULES
import { BusPortalModule } from './nrt/bus-portal/bus-portal.module';
import { PaymentModule as NrtPaymentModule } from './nrt/payment/payment.module';
import { ChatbotModule } from './nrt/chatbot/chatbot.module';
import { EmailModule } from './nrt/email/email.module';
import { CouponModule } from './nrt/coupon/coupon.module';
import { SitemapModule } from './nrt/sitemap/sitemap.module';
import { CampaignModule } from './nrt/campaign/campaign.module';
import { AutomationModule } from './nrt/automation/automation.module';
import { OfflineBookingModule } from './nrt/offline-booking/offline-booking.module';

// NRT CMS ENGINE MODULES
import { ContentTypeModule } from './nrt/cms/content-type.module';
import { PageModule } from './nrt/cms/page.module';
import { MediaModule } from './nrt/media/media.module';
import { PluginModule } from './nrt/plugin/plugin.module';
import { AuditModule } from './nrt/audit/audit.module';

import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
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
    NotificationsModule,
    TicketingModule,
    ReportingModule,
    CrewModule,
    CouponsModule,
    CmsModule,
    CampaignsModule,

    // ─── NRT CMS Content ────────────────────────────────
    BusServiceModule,
    TourPackageModule,
    VehicleRentalModule,
    AboutModule,
    TestimonialModule,
    HeroBannerModule,
    ContactModule,
    BlogModule,
    BlogAuthorModule,
    FAQModule,
    TeamModule,
    AchievementModule,
    GalleryModule,
    SiteSettingModule,
    SliderModule,
    FeatureModule,
    DestinationModule,
    StoryModule,
    AdventureActivityModule,

    // ─── NRT Submissions / Inquiries ────────────────────
    EmailSubscriberModule,
    BookingInquiryModule,
    PartnerRequestModule,
    ContactSubmissionModule,
    SupportTicketModule,

    // ─── NRT Core Business ──────────────────────────────
    BusPortalModule,
    NrtPaymentModule,
    ChatbotModule,
    EmailModule,
    CouponModule,
    SitemapModule,
    CampaignModule,
    AutomationModule,
    OfflineBookingModule,

    // ─── NRT CMS Engine ─────────────────────────────────
    ContentTypeModule,
    PageModule,
    MediaModule,
    PluginModule,
    AuditModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
