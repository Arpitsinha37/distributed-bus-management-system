# 🚌 Distributed Bus Management System

A full-stack, multi-tenant bus booking platform built with **NestJS**, **Next.js**, **Prisma**, **PostgreSQL**, **Redis**, and **Docker**. Designed to manage multiple branded storefronts from a single backend, with a unified CMS admin panel.

[![CI](https://github.com/Arpitsinha37/distributed-bus-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/Arpitsinha37/distributed-bus-management-system/actions/workflows/ci.yml)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                              │
│                   (Next.js @ :3002)                              │
│          CMS • Analytics • Fleet • Campaigns • Settings         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                     REST API (JWT)
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                     NestJS BACKEND                              │
│                      (API @ :3001)                               │
│  Auth • Bookings • Payments • Schedules • Routes • CMS • Crew  │
│  Campaigns • Coupons • Reporting • Notifications • Ticketing    │
└───────────┬─────────────┬─────────────────┬─────────────────────┘
            │             │                 │
      ┌─────┴─────┐ ┌────┴────┐    ┌───────┴───────┐
      │ PostgreSQL │ │  Redis  │    │  Storefronts  │
      │  (:5433)   │ │ (:6379) │    │   (:3000+)    │
      └────────────┘ └─────────┘    └───────────────┘
```

### Monorepo Structure

| Directory | Description | Port |
|---|---|---|
| `bus-booking-backend/` | NestJS API server with Prisma ORM | 3001 |
| `admin-panel/` | Next.js CMS admin dashboard | 3002 |
| `storefront/` | Pokhara Travels branded storefront | 3000 |
| `storefront-chitwan/` | Chitwan Express branded storefront | 3003 |
| `storefront-lumbini/` | Lumbini Bus Services branded storefront | 3004 |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose)
- [Node.js 20+](https://nodejs.org/) (for local development)

### 1. Clone & Start

```bash
git clone https://github.com/Arpitsinha37/distributed-bus-management-system.git
cd distributed-bus-management-system

# Start the full stack (backend + postgres + redis)
docker-compose up -d

# Seed the database with demo data
docker exec -it distributedbusmanagementsystem-backend-1 npx prisma db seed
```

### 2. Run the Admin Panel

```bash
cd admin-panel
npm install
npm run dev   # → http://localhost:3002
```

### 3. Run a Storefront

```bash
cd storefront          # or storefront-chitwan, storefront-lumbini
npm install
npm run dev            # → http://localhost:3000
```

### Default Login

| Email | Password | Role |
|---|---|---|
| `admin@newroadtravels.com` | `admin123` | SUPER_ADMIN |

---

## ✨ Features

### Core Booking Engine
- 🔍 Route search with boarding/dropping points
- 💺 Real-time seat selection with visual layout maps
- 🎫 Booking with PNR generation and QR-code tickets
- 💳 Multi-gateway payments (eSewa, Khalti, Cash)
- 🔒 Seat hold/lock mechanism to prevent double-booking

### Fleet & Operations
- 🚌 Bus management with detailed vehicle records
- 🗺️ Route management with distance and duration
- 📅 Schedule management with day-of-week patterns
- 👨‍✈️ Crew assignment (drivers, helpers, conductors)
- 🎟️ Coupon & discount management

### Admin Panel (CMS)
- 📊 Analytics dashboard with revenue charts
- 💰 Payment tracking with gateway-level stats
- 📝 Full CMS: blogs, FAQs, testimonials, team, gallery, sliders
- 🎯 AI Campaign Studio (Gemini-powered email marketing)
- 🛡️ Resilient error boundaries across all pages

### Multi-Tenant Architecture
- 🏪 Multiple branded storefronts from a single backend
- 🔐 Tenant isolation via `X-Site-Id` header middleware
- 🎨 Per-site theming, branding, and content

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS, Prisma, PostgreSQL, Redis |
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS |
| **Auth** | JWT with Passport.js, role-based access control |
| **Infra** | Docker Compose, GitHub Actions CI |
| **Payments** | eSewa, Khalti (gateway adapters) |

---

## 📁 Environment Variables

Each service has its own `.env` file. See the `.env.local.example` files in each directory for reference.

### Backend (`bus-booking-backend/.env`)

```env
PORT=3001
DATABASE_URL="postgresql://cms_user:cms_password@localhost:5433/bus_booking"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="8h"
```

---

## 🧪 CI/CD

GitHub Actions CI runs on every push to `main`:

- **Backend**: Prisma generate → NestJS build → TypeScript check
- **Admin Panel**: Next.js build
- **Storefronts**: Parallel matrix build for all 3 storefronts

---

## 📄 License

This project is private. All rights reserved.
