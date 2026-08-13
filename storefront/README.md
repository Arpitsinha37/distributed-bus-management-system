# Storefront A — Next.js

One of N branded storefronts, all hitting the same backend. Branding
(name, domain) lives in `NEXT_PUBLIC_SITE_ID`, which every API request
sends as the `X-Site-Id` header — see `src/lib/api.ts`. Storefront #2 is a
copy of this folder with a different env value, palette, and domain.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point at your running backend
npm run dev
```

Needs the backend running (see `bus-booking-backend/README.md`) with at
least one seeded site/route/schedule — run its `prisma/seed.ts` first.

## Flow

`/` (search) → `/search` (results) → `/trip/[id]` (seat map + passenger
details, submits to `POST /bookings/hold`) → `/booking/[id]` (ticket-stub
confirmation, reads `GET /bookings/:id`).

## Not wired up yet

- Payment gateway redirect/embed after the seat hold (`POST /payments/:gateway/initiate` exists on the backend; this storefront doesn't call it yet)
- Polling or a webhook-driven refresh on the booking page so status flips from PENDING to CONFIRMED without a manual reload
