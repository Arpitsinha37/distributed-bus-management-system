# Bus booking backend — NestJS + Prisma

Single backend for every storefront. Each frontend site sends an
`X-Site-Id` header (the site's `slug`) with every request; the backend
uses it to tag bookings and pull branding, but the routes/buses/schedules
catalog is shared across all sites. See `src/common/decorators/site-id.decorator.ts`.

## Setup

```bash
npm install
cp .env.example .env         # fill in DATABASE_URL, REDIS_URL, JWT_SECRET
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts   # optional: creates a demo site, bus, route, schedule, admin login
npm run start:dev
```

Requires Postgres and Redis running locally (or point `.env` at managed
instances — Railway/Supabase/Neon for Postgres, Upstash for Redis both
work well for this).

## Module map

| Module          | Responsibility                                                        |
|------------------|-------------------------------------------------------------------------|
| `sites`          | Storefront config (branding, domain, currency) — add a row, not code |
| `auth`           | Staff login, JWT, role guard                                          |
| `fleet`          | Buses + reusable seat-layout templates                                |
| `routes`         | Origin/destination city pairs                                         |
| `schedules`      | Recurring departure patterns                                          |
| `trips`          | Sellable instances generated from schedules; public search endpoint   |
| `bookings`       | Seat holds (Redis + Postgres), booking creation, expiry               |
| `payments`       | Gateway-agnostic provider interface, idempotent webhook, reconciliation |
| `ticketing`      | Issues the ticket once a booking is confirmed                         |
| `notifications`  | Email / SMS / WhatsApp, called by ticketing                           |
| `reporting`      | Revenue/occupancy, filterable per site                                |

## The booking flow

1. `GET /trips/search?origin=&destination=&date=` — public, storefront calls this
2. `POST /bookings/hold` — locks chosen seats for `SEAT_HOLD_MINUTES` (Redis lock + Postgres `HELD` status), creates a `PENDING` booking
3. `POST /payments/:gateway/initiate` — starts the payment
4. Gateway calls `POST /payments/:gateway/webhook` — verifies signature, confirms the booking (idempotent), which flips seats to `BOOKED`
5. `TicketingService.issueTicket()` — call this after step 4 confirms (wire it into `PaymentsService.handleWebhook`'s success branch) to generate the ticket and notify the customer
6. A cron job (`BookingsService.releaseExpiredHolds`) frees seats from abandoned checkouts every minute
7. Another cron job (`PaymentsService.reconcileStalePayments`) catches the "customer was charged but the webhook never arrived" case

## Still stubbed — fill in before going live

- `providers/stripe.provider.ts` — plug in the real Stripe SDK (or write `esewa.provider.ts` / `khalti.provider.ts` following the same `PaymentProvider` interface)
- `notifications.service.ts` — plug in SendGrid/SES, an SMS gateway, and the WhatsApp Cloud API
- `ticketing.service.ts` — plug in a QR/PDF library
- Wire `TicketingService.issueTicket()` into `PaymentsService.handleWebhook()`'s success branch
- Customer-facing booking lookup/cancellation endpoint (by booking ref + phone, not just the admin one)

## Adding storefront #4

1. `POST /sites` with the new slug/domain/branding (admin-only)
2. New frontend deployment with `SITE_ID=<slug>` in its env
3. Nothing else in the backend changes
