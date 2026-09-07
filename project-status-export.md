# Distributed Bus Management System - Project Status Export

Generated: 2026-09-07
Repository root: `d:\distributed bus management system`

> Redaction note: secrets, passwords, tokens, and API keys have been replaced with `<REDACTED>` where they appear in shared output.

---

## 1) Service file trees (3 levels deep, excluding node_modules/.next/dist)

### admin-panel
```text
admin-panel/
├── .env.production
├── Dockerfile
├── README.md
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── ts_errors.txt
├── public/
│   └── site.webmanifest
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── page.tsx
│   │   ├── sentry-example-page/
│   │   └── sites/
│   ├── components/
│   │   ├── CounterBookingModal.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── InternalLinkPicker.tsx
│   │   ├── MediaPickerModal.tsx
│   │   ├── RichEditor.tsx
│   │   ├── Sidebar.tsx
│   │   ├── rich-editor.css
│   │   └── editor/
│   └── lib/
│       ├── api.ts
│       ├── store.ts
│       ├── useAuth.ts
│       └── useDebounce.ts
└──
```

### bus-booking-backend
```text
bus-booking-backend/
├── .env
├── .env.example
├── Dockerfile
├── README.md
├── nest-cli.json
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/
│   ├── bookings/
│   │   ├── bookings.controller.ts
│   │   ├── bookings.module.ts
│   │   ├── bookings.service.ts
│   │   ├── seat-lock.service.ts
│   │   └── dto/
│   ├── bus-portal/
│   │   ├── bus-portal.module.ts
│   │   └── bus-portal.service.ts
│   ├── cms/
│   │   ├── cms.controller.ts
│   │   ├── cms.module.ts
│   │   └── ...
│   ├── common/
│   │   ├── decorators/
│   │   ├── enums/
│   │   ├── guards/
│   │   └── utils/
│   ├── coupon/
│   ├── coupons/
│   │   ├── coupons.controller.ts
│   │   ├── coupons.module.ts
│   │   ├── coupons.service.ts
│   │   └── dto/
│   ├── crew/
│   │   ├── crew.controller.ts
│   │   ├── crew.module.ts
│   │   ├── crew.service.ts
│   │   └── dto/
│   ├── email/
│   ├── fleet/
│   │   ├── fleet.controller.ts
│   │   ├── fleet.module.ts
│   │   ├── fleet.service.ts
│   │   └── dto/
│   ├── notifications/
│   ├── payment/
│   │   ├── payment.controller.ts
│   │   ├── payment.module.ts
│   │   ├── payment.service.ts
│   │   └── ...
│   ├── payments/
│   │   ├── payments.controller.ts
│   │   ├── payments.module.ts
│   │   ├── payments.service.ts
│   │   └── ...
│   ├── prisma/
│   │   └── prisma.service.ts
│   ├── reporting/
│   │   ├── reporting.controller.ts
│   │   ├── reporting.module.ts
│   │   └── reporting.service.ts
│   ├── routes/
│   │   ├── routes.controller.ts
│   │   ├── routes.module.ts
│   │   ├── routes.service.ts
│   │   └── dto/
│   ├── schedules/
│   │   ├── schedules.controller.ts
│   │   ├── schedules.module.ts
│   │   ├── schedules.service.ts
│   │   └── dto/
│   ├── sites/
│   │   ├── sites.controller.ts
│   │   ├── sites.module.ts
│   │   ├── sites.service.ts
│   │   └── dto/
│   ├── staff/
│   │   ├── staff.controller.ts
│   │   ├── staff.module.ts
│   │   ├── staff.service.ts
│   │   └── dto/
│   ├── ticketing/
│   ├── trips/
│   │   ├── trips.controller.ts
│   │   ├── trips.module.ts
│   │   ├── trips.service.ts
│   │   └── dto/
│   └── ...
└──
```

### storefront
```text
storefront/
├── Dockerfile
├── README.md
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── images/
│   └── site.webmanifest
├── src/
│   ├── app/
│   │   ├── book/
│   │   ├── layout.tsx
│   │   ├── payment/
│   │   ├── schedule/
│   │   ├── search/
│   │   ├── ticket/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── cities.ts
│   │   └── ...
│   ├── middleware.ts
│   └── ...
└──
```

### storefront-chitwan
```text
storefront-chitwan/
├── Dockerfile
├── README.md
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── images/
│   └── site.webmanifest
├── src/
│   ├── app/
│   │   ├── book/
│   │   ├── layout.tsx
│   │   ├── payment/
│   │   ├── schedule/
│   │   ├── search/
│   │   ├── ticket/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── cities.ts
│   │   └── ...
│   ├── middleware.ts
│   └── ...
└──
```

### storefront-lumbini
```text
storefront-lumbini/
├── Dockerfile
├── README.md
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── images/
│   └── site.webmanifest
├── src/
│   ├── app/
│   │   ├── book/
│   │   ├── layout.tsx
│   │   ├── payment/
│   │   ├── schedule/
│   │   ├── search/
│   │   ├── ticket/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── cities.ts
│   │   └── ...
│   ├── middleware.ts
│   └── ...
└──
```

### infrastructure
```text
infrastructure/
├── README.md
├── template.yaml
└──
```

---

## 2) Full contents of the requested configuration files

### docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    ports:
      - '5434:5432'
    environment:
      POSTGRES_USER: cms_user
      POSTGRES_PASSWORD: '<REDACTED>'
      POSTGRES_DB: bus_booking
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U cms_user -d bus_booking']
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - '6380:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: ./bus-booking-backend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      PORT: '3001'
      DATABASE_URL: '<REDACTED>'
      REDIS_URL: 'redis://redis:6379'
      JWT_SECRET: '<REDACTED>'
      JWT_EXPIRES_IN: '8h'
      SEAT_HOLD_MINUTES: '8'
      ESEWA_MERCHANT_CODE: '<REDACTED>'
      KHALTI_SECRET_KEY: '<REDACTED>'
      STRIPE_SECRET_KEY: '<REDACTED>'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  storefront:
    build:
      context: ./storefront
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - '3003:3000'
    environment:
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1'
      NEXT_PUBLIC_SITE_ID: 'pokhara-travels'
    depends_on:
      - backend

  admin-panel:
    build:
      context: ./admin-panel
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - '3002:3000'
    environment:
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1'
    depends_on:
      - backend

  storefront-lumbini:
    build:
      context: ./storefront-lumbini
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - '3005:3000'
    environment:
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1'
      NEXT_PUBLIC_SITE_ID: 'ktm-lumbini-services'
    depends_on:
      - backend

volumes:
  pgdata:
```

### prisma/schema.prisma
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum StaffRole {
  SUPER_ADMIN   // sees and manages every site
  SITE_MANAGER  // scoped to their assigned site(s)
  COUNTER_AGENT // scoped to their assigned site(s), booking-only
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  EXPIRED
}

enum PaymentStatus {
  INITIATED
  SUCCESS
  FAILED
  REFUNDED
}

enum SeatStatus {
  AVAILABLE
  HELD
  BOOKED
}

// ── Storefronts ─────────────────────────────────────────────
// One row per branded site. Adding a 4th storefront is a new row here,
// not new backend code.
model Site {
  id           String      @id @default(cuid())
  slug         String      @unique // used as the X-Site-Id sent by each frontend
  name         String
  domain       String      @unique
  logoUrl      String?
  themeColor   String?
  currency     String      @default("NPR")
  contactPhone String?
  contactEmail String?
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  staff        StaffSite[]
  bookings     Booking[]
}

// ── Staff / admin panel users ───────────────────────────────
model Staff {
  id           String      @id @default(cuid())
  name         String
  email        String      @unique
  passwordHash String
  role         StaffRole   @default(COUNTER_AGENT)
  isActive     Boolean     @default(true)
  createdAt    DateTime    @default(now())

  sites        StaffSite[]
}

// join table: which sites a staff member can operate on (empty = all, for SUPER_ADMIN)
model StaffSite {
  staffId String
  siteId  String
  staff   Staff  @relation(fields: [staffId], references: [id])
  site    Site   @relation(fields: [siteId], references: [id])

  @@id([staffId, siteId])
}

// ── Fleet ────────────────────────────────────────────────────
// Reusable seat-map templates (2x2 seater, sofa, sleeper, etc.) so you
// define a layout once and reuse it across many buses.
model SeatLayout {
  id         String   @id @default(cuid())
  name       String
  totalSeats Int
  layoutJson Json     // e.g. { rows: [...], seats: [{ number: "A1", type: "window" }, ...] }
  createdAt  DateTime @default(now())

  buses      Bus[]
}

model Bus {
  id              String     @id @default(cuid())
  registrationNo  String     @unique
  type            String     // e.g. AC Sleeper, Non-AC Seater, VIP Sofa
  brand           String?    // e.g. Tata, Ashok Leyland
  model           String?    // e.g. Starbus Ultra
  manufacturingYear Int?
  images          String[]   @default([])
  amenities       String[]   // e.g. ["wifi", "charging", "blanket"]
  ownerName       String?
  ownerPhone      String?
  insuranceNo     String?
  insuranceExpiry DateTime?
  fitnessExpiry   DateTime?
  permitExpiry    DateTime?
  rcNumber        String?    // Registration Certificate
  seatLayoutId    String
  seatLayout      SeatLayout @relation(fields: [seatLayoutId], references: [id])
  isActive        Boolean    @default(true)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @default(now()) @updatedAt

  schedules       Schedule[]
  trips           Trip[]
}

// ── Routes & schedules ──────────────────────────────────────
model Route {
  id              String     @id @default(cuid())
  originCity      String
  destinationCity String
  distanceKm      Float?
  durationMinutes Int?
  boardingPoints  String[]
  droppingPoints  String[]
  createdAt       DateTime   @default(now())

  schedules       Schedule[]

  @@index([originCity, destinationCity])
}

model Schedule {
  id            String   @id @default(cuid())
  routeId       String
  busId         String
  departureTime String   // "07:00"
  daysOfWeek    Int[]    // 0=Sun..6=Sat; empty array = runs every day
  fare          Decimal  @db.Decimal(10, 2)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  route         Route    @relation(fields: [routeId], references: [id])
  bus           Bus      @relation(fields: [busId], references: [id])
  trips         Trip[]
  fareTiers     FareTier[]
}

model Trip {
  id         String     @id @default(cuid())
  scheduleId String
  busId      String
  travelDate DateTime   @db.Date
  status     String     @default("SCHEDULED") // SCHEDULED | CANCELLED | DEPARTED
  createdAt  DateTime   @default(now())

  schedule   Schedule   @relation(fields: [scheduleId], references: [id])
  bus        Bus        @relation(fields: [busId], references: [id])
  seats      TripSeat[]
  bookings   Booking[]
  crew       TripCrew[]

  @@unique([scheduleId, travelDate])
  @@index([travelDate])
}

model TripSeat {
  id         String     @id @default(cuid())
  tripId     String
  seatNumber String
  status     SeatStatus @default(AVAILABLE)
  heldUntil  DateTime?  // seat hold expiry during checkout
  bookingId  String?

  trip       Trip       @relation(fields: [tripId], references: [id])
  booking    Booking?   @relation(fields: [bookingId], references: [id])

  @@unique([tripId, seatNumber])
}

model Booking {
  id            String        @id @default(cuid())
  bookingRef    String        @unique
  siteId        String
  tripId        String
  customerName  String
  customerPhone String
  customerEmail String?
  customerId    String?
  totalFare     Decimal       @db.Decimal(10, 2)
  status        BookingStatus @default(PENDING)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  site          Site          @relation(fields: [siteId], references: [id])
  trip          Trip          @relation(fields: [tripId], references: [id])
  customer      Customer?     @relation(fields: [customerId], references: [id])
  passengers    Passenger[]
  seats         TripSeat[]
  payment       Payment?
  ticket        Ticket?

  @@index([siteId])
  @@index([status])
  @@index([customerId])
}

model Passenger {
  id         String  @id @default(cuid())
  bookingId  String
  name       String
  age        Int?
  gender     String?
  seatNumber String

  booking    Booking @relation(fields: [bookingId], references: [id])
}

enum CrewRole {
  DRIVER
  HELPER
  CONDUCTOR
}

model CrewMember {
  id             String    @id @default(cuid())
  name           String
  phone          String    @unique
  email          String?
  licenseNo      String?
  licenseExpiry  DateTime?
  address        String?
  emergencyPhone String?
  role           CrewRole
  photoUrl       String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  tripAssignments TripCrew[]
}

model TripCrew {
  id           String     @id @default(cuid())
  tripId       String
  crewMemberId String
  role         CrewRole

  trip         Trip       @relation(fields: [tripId], references: [id])
  crewMember   CrewMember @relation(fields: [crewMemberId], references: [id])

  @@unique([tripId, crewMemberId])
}

model Payment {
  id           String        @id @default(cuid())
  bookingId    String        @unique
  gateway      String
  gatewayTxnId String?       @unique
  amount       Decimal       @db.Decimal(10, 2)
  status       PaymentStatus @default(INITIATED)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  booking      Booking       @relation(fields: [bookingId], references: [id])
}

model Ticket {
  id        String   @id @default(cuid())
  bookingId String   @unique
  qrCode    String
  pdfUrl    String?
  issuedAt  DateTime @default(now())

  booking   Booking  @relation(fields: [bookingId], references: [id])
}

model FareTier {
  id            String   @id @default(cuid())
  scheduleId    String
  seatType      String
  boardingPoint String?
  amount        Decimal  @db.Decimal(10, 2)

  schedule      Schedule @relation(fields: [scheduleId], references: [id])

  @@unique([scheduleId, seatType, boardingPoint])
}

model Coupon {
  id               String    @id @default(cuid())
  code             String    @unique
  discountType     String
  discountValue    Decimal   @db.Decimal(10, 2)
  maxUses          Int?
  usedCount        Int       @default(0)
  minBookingAmount Decimal?  @db.Decimal(10, 2)
  validFrom        DateTime
  validTo          DateTime
  isActive         Boolean   @default(true)
  siteId           String?
  createdAt        DateTime  @default(now())
}

model Customer {
  id         String    @id @default(cuid())
  name       String
  phone      String    @unique
  email      String?
  bookings   Booking[]
  createdAt  DateTime  @default(now())
}

model CancellationPolicy {
  id              String   @id @default(cuid())
  hoursBeforeDep  Int
  refundPercent   Int
  createdAt       DateTime @default(now())
}

model Slider {
  id        String   @id @default(cuid())
  siteId    String?
  title     String
  subtitle  String?
  imageUrl  String
  linkUrl   String?
  isActive  Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model Blog {
  id        String   @id @default(cuid())
  siteId    String?
  title     String
  slug      String   @unique
  excerpt   String?
  content   String   @db.Text
  coverImage String?
  author    String?
  isPublished Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Testimonial {
  id        String   @id @default(cuid())
  siteId    String?
  name      String
  role      String?
  content   String   @db.Text
  rating    Int      @default(5)
  avatarUrl String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model TeamMember {
  id        String   @id @default(cuid())
  siteId    String?
  name      String
  role      String
  bio       String?  @db.Text
  imageUrl  String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
}

model FAQ {
  id        String   @id @default(cuid())
  siteId    String?
  question  String
  answer    String   @db.Text
  order     Int      @default(0)
  isActive  Boolean  @default(true)
}

model GalleryImage {
  id        String   @id @default(cuid())
  siteId    String?
  title     String?
  imageUrl  String
  category  String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

model SiteSetting {
  id          String   @id @default(cuid())
  siteId      String?  @unique
  aboutUsText String?  @db.Text
  contactInfo Json?
  termsText   String?  @db.Text
  privacyText String?  @db.Text
  updatedAt   DateTime @updatedAt
}
```

### infrastructure/template.yaml
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Distributed Bus Management System - Backend Infrastructure'

Parameters:
  DBUsername:
    Type: String
    Default: cms_user
    Description: PostgreSQL Database Username
  DBPassword:
    Type: String
    NoEcho: true
    Description: PostgreSQL Database Password
  JwtSecret:
    Type: String
    NoEcho: true
    Description: Secret key for signing JWT tokens

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: bus-booking-vpc

  InternetGateway:
    Type: AWS::EC2::InternetGateway

  AttachGateway:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [ 0, !GetAZs '' ]
      MapPublicIpOnLaunch: true

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [ 1, !GetAZs '' ]
      MapPublicIpOnLaunch: true

  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC

  PublicRoute:
    Type: AWS::EC2::Route
    DependsOn: AttachGateway
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PublicSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet1
      RouteTableId: !Ref PublicRouteTable

  PublicSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet2
      RouteTableId: !Ref PublicRouteTable

  LoadBalancerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow HTTP/HTTPS traffic to Load Balancer
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  BackendSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow traffic from Load Balancer to Backend
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3001
          ToPort: 3001
          SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup

  DatabaseSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow traffic from Backend to Postgres and Redis
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref BackendSecurityGroup
        - IpProtocol: tcp
          FromPort: 6379
          ToPort: 6379
          SourceSecurityGroupId: !Ref BackendSecurityGroup

  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnets for RDS
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  PostgresDB:
    Type: AWS::RDS::DBInstance
    Properties:
      AllocatedStorage: 20
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '15.7'
      MasterUsername: !Ref DBUsername
      MasterUserPassword: !Ref DBPassword
      DBName: bus_booking
      DBSubnetGroupName: !Ref DBSubnetGroup
      VPCSecurityGroups:
        - !Ref DatabaseSecurityGroup
      PubliclyAccessible: true

  CacheSubnetGroup:
    Type: AWS::ElastiCache::SubnetGroup
    Properties:
      Description: Subnets for ElastiCache
      SubnetIds:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheNodeType: cache.t3.micro
      Engine: redis
      NumCacheNodes: 1
      CacheSubnetGroupName: !Ref CacheSubnetGroup
      VpcSecurityGroupIds:
        - !Ref DatabaseSecurityGroup

  BackendRepository:
    Type: AWS::ECR::Repository
    Properties:
      RepositoryName: bus-booking-backend

  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref LoadBalancerSecurityGroup

  BackendTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      VpcId: !Ref VPC
      Port: 3001
      Protocol: HTTP
      TargetType: ip
      HealthCheckPath: /api/v1/health

  HttpListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref BackendTargetGroup

  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: bus-booking-cluster

  ECSTaskExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: ecs-tasks.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

  BackendTaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: bus-booking-backend-task
      Cpu: '512'
      Memory: '1024'
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      ExecutionRoleArn: !GetAtt ECSTaskExecutionRole.Arn
      ContainerDefinitions:
        - Name: backend
          Image: !Sub "${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/bus-booking-backend:latest"
          PortMappings:
            - ContainerPort: 3001
          Environment:
            - Name: PORT
              Value: '3001'
            - Name: DATABASE_URL
              Value: !Sub "postgresql://${DBUsername}:${DBPassword}@${PostgresDB.Endpoint.Address}:${PostgresDB.Endpoint.Port}/bus_booking?schema=public"
            - Name: REDIS_URL
              Value: !Sub "redis://${RedisCluster.RedisEndpoint.Address}:${RedisCluster.RedisEndpoint.Port}"
            - Name: JWT_SECRET
              Value: !Ref JwtSecret
            - Name: JWT_EXPIRES_IN
              Value: '8h'
            - Name: SEAT_HOLD_MINUTES
              Value: '8'
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: /ecs/bus-booking-backend
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs

  BackendLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /ecs/bus-booking-backend
      RetentionInDays: 7

  BackendService:
    Type: AWS::ECS::Service
    Properties:
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref BackendTaskDefinition
      DesiredCount: 1
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          AssignPublicIp: ENABLED
          Subnets:
            - !Ref PublicSubnet1
            - !Ref PublicSubnet2
          SecurityGroups:
            - !Ref BackendSecurityGroup
      LoadBalancers:
        - ContainerName: backend
          ContainerPort: 3001
          TargetGroupArn: !Ref BackendTargetGroup

Outputs:
  ApiUrl:
    Description: "Base URL for your Backend API"
    Value: !Sub "http://${ApplicationLoadBalancer.DNSName}"
  PostgresEndpoint:
    Description: "Endpoint for connecting to Postgres locally"
    Value: !GetAtt PostgresDB.Endpoint.Address
  EcrRepositoryUri:
    Description: "URI to push your backend docker image to"
    Value: !Sub "${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/bus-booking-backend"
```

### package.json dependencies only

#### backend
```json
{
  "dependencies": {
    "@nestjs/axios": "^3.1.0",
    "@nestjs/common": "^10.4.0",
    "@nestjs/config": "^3.2.3",
    "@nestjs/core": "^10.4.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/mapped-types": "*",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.0",
    "@nestjs/schedule": "^4.1.0",
    "@nestjs/swagger": "^7.4.0",
    "@prisma/client": "^5.19.0",
    "@types/bcryptjs": "^2.4.6",
    "axios": "^1.20.0",
    "bcryptjs": "^3.0.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "ioredis": "^5.4.1",
    "jose": "^6.2.10",
    "nanoid": "^3.3.7",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  }
}
```

#### admin-panel
```json
{
  "dependencies": {
    "@ckeditor/ckeditor5-react": "^11.1.2",
    "@hookform/resolvers": "^3.9.0",
    "@sentry/nextjs": "^10.45.0",
    "@types/escape-html": "^1.0.4",
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1",
    "ckeditor5": "^48.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "escape-html": "^1.0.3",
    "jodit-react": "^5.3.21",
    "lucide-react": "^0.460.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-hook-form": "^7.53.0",
    "react-quill": "^2.0.0",
    "recharts": "^2.13.0",
    "tailwind-merge": "^2.5.0",
    "zod": "^3.23.0",
    "zustand": "^4.5.0"
  }
}
```

#### storefront
```json
{
  "dependencies": {
    "@react-three/drei": "^9.122.0",
    "@react-three/fiber": "^8.18.0",
    "axios": "^1.19.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "dayjs": "^1.11.21",
    "framer-motion": "^13.1.1",
    "lucide-react": "^1.31.0",
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-day-picker": "^10.0.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.6.0",
    "three": "^0.185.1",
    "zustand": "^5.0.15"
  }
}
```

#### storefront-chitwan
```json
{
  "dependencies": {
    "@react-three/drei": "^9.122.0",
    "@react-three/fiber": "^8.18.0",
    "axios": "^1.19.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "dayjs": "^1.11.21",
    "framer-motion": "^13.1.1",
    "lucide-react": "^1.31.0",
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-day-picker": "^10.0.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.6.0",
    "three": "^0.185.1",
    "zustand": "^5.0.15"
  }
}
```

#### storefront-lumbini
```json
{
  "dependencies": {
    "@react-three/drei": "^9.122.0",
    "@react-three/fiber": "^8.18.0",
    "axios": "^1.19.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "dayjs": "^1.11.21",
    "framer-motion": "^13.1.1",
    "lucide-react": "^1.31.0",
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-day-picker": "^10.0.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.6.0",
    "three": "^0.185.1",
    "zustand": "^5.0.15"
  }
}
```

---

## 3) Actual backend endpoints (method + path)

Global prefix in `main.ts`: `/api/v1`

### auth
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### bookings
- `GET /api/v1/bookings`
- `POST /api/v1/bookings/:id/cancel`
- `POST /api/v1/bookings/counter`
- `POST /api/v1/bookings/hold`
- `GET /api/v1/bookings/track`
- `POST /api/v1/bookings/cancel`
- `GET /api/v1/bookings/:id`
- `POST /api/v1/bookings/:id/mock-pay`
- `POST /api/v1/bookings/calculate-fare`

### cms
- `GET /api/v1/cms/sliders`
- `GET /api/v1/cms/blogs`
- `GET /api/v1/cms/testimonials`
- `GET /api/v1/cms/team`
- `GET /api/v1/cms/faqs`
- `GET /api/v1/cms/gallery`
- `GET /api/v1/cms/settings`
- `POST /api/v1/cms/sliders`
- `PATCH /api/v1/cms/sliders/:id`
- `DELETE /api/v1/cms/sliders/:id`
- `POST /api/v1/cms/blogs`
- `PATCH /api/v1/cms/blogs/:id`
- `DELETE /api/v1/cms/blogs/:id`
- `POST /api/v1/cms/testimonials`
- `PATCH /api/v1/cms/testimonials/:id`
- `DELETE /api/v1/cms/testimonials/:id`
- `POST /api/v1/cms/team`
- `PATCH /api/v1/cms/team/:id`
- `DELETE /api/v1/cms/team/:id`
- `POST /api/v1/cms/faqs`
- `PATCH /api/v1/cms/faqs/:id`
- `DELETE /api/v1/cms/faqs/:id`
- `POST /api/v1/cms/gallery`
- `PATCH /api/v1/cms/gallery/:id`
- `DELETE /api/v1/cms/gallery/:id`
- `POST /api/v1/cms/settings`

### coupons
- `POST /api/v1/coupons`
- `GET /api/v1/coupons`
- `GET /api/v1/coupons/:id`
- `PATCH /api/v1/coupons/:id`
- `DELETE /api/v1/coupons/:id`

### crew
- `POST /api/v1/crew`
- `GET /api/v1/crew`
- `GET /api/v1/crew/:id`
- `PATCH /api/v1/crew/:id`
- `DELETE /api/v1/crew/:id`

### fleet
- `POST /api/v1/fleet/seat-layouts`
- `GET /api/v1/fleet/seat-layouts`
- `GET /api/v1/fleet/seat-layouts/:id`
- `PATCH /api/v1/fleet/seat-layouts/:id`
- `GET /api/v1/fleet/buses/expiring`
- `POST /api/v1/fleet/buses`
- `GET /api/v1/fleet/buses`
- `GET /api/v1/fleet/buses/:id`
- `PATCH /api/v1/fleet/buses/:id`

### reporting
- `GET /api/v1/reporting/revenue`
- `GET /api/v1/reporting/overview`

### routes
- `GET /api/v1/routes/cities`
- `POST /api/v1/routes`
- `GET /api/v1/routes`
- `GET /api/v1/routes/:id`
- `PATCH /api/v1/routes/:id`

### schedules
- `POST /api/v1/schedules`
- `GET /api/v1/schedules`
- `GET /api/v1/schedules/:id`
- `PATCH /api/v1/schedules/:id`

### sites
- `GET /api/v1/sites/by-slug/:slug`
- `POST /api/v1/sites`
- `GET /api/v1/sites`
- `PATCH /api/v1/sites/:id`

### staff
- `POST /api/v1/staff`
- `GET /api/v1/staff`
- `GET /api/v1/staff/:id`
- `PATCH /api/v1/staff/:id`
- `DELETE /api/v1/staff/:id`

### trips
- `GET /api/v1/trips/search`
- `GET /api/v1/trips/:id`
- `POST /api/v1/trips/:id/crew`
- `GET /api/v1/trips/:id/crew`
- `DELETE /api/v1/trips/:id/crew/:crewId`

### payments (legacy/alternate module)
- `POST /api/v1/payments/:gateway/initiate`
- `POST /api/v1/payments/:gateway/webhook`

### payment (main payment flow controller)
- `POST /api/v1/payments/initiate`
- `GET /api/v1/payments/esewa/success`
- `GET /api/v1/payments/esewa/success/:payload`
- `GET /api/v1/payments/esewa/failure`
- `GET /api/v1/payments/esewa/failure/:payload`
- `GET /api/v1/payments/khalti/verify`
- `GET /api/v1/payments/khalti/verify/:payload`
- `GET /api/v1/payments/card/success`
- `GET /api/v1/payments/card/success/:payload`
- `GET /api/v1/payments/card/failure`
- `GET /api/v1/payments/card/failure/:payload`
- `GET /api/v1/payments/card/cancel`
- `GET /api/v1/payments/card/cancel/:payload`
- `POST /api/v1/payments/card/backend`
- `POST /api/v1/payments/:id/card/inquiry`
- `POST /api/v1/payments/:id/card/refund`
- `POST /api/v1/payments/:id/card/void`
- `GET /api/v1/payments/test-email`
- `GET /api/v1/payments/ticket/:ticketNo`
- `GET /api/v1/payments/phone/:phone`
- `GET /api/v1/payments`
- `GET /api/v1/payments/stats`
- `GET /api/v1/payments/analytics`
- `POST /api/v1/payments/:id/sync`
- `POST /api/v1/payments/:id/force-complete`

---

## 4) Current seed data actually present in `prisma/seed.ts`

### Sites
- `pokhara-travels` — Pokhara Travels
- `ktm-lumbini-services` — Lumbini Express

### Buses
- `BA-1-KHA-5678` — VIP Sofa — Ashok Leyland Viking — 2023 — seat layout `VIP Sofa 2/1`
- `BA-2-KHA-9012` — Super Deluxe — Tata Starbus Ultra — 2022 — seat layout `Standard 2/2`
- `BA-3-KHA-3456` — VIP Sofa — Ashok Leyland Viking — 2024 — seat layout `VIP Sofa 2/1`

### Routes
- `Pokhara -> Kathmandu` — 200 km, 600 min, boarding points: Tourist Bus Park (Rashtriya Bank Chowk), Prithvi Chowk, Narayangarh (Bypass); dropping points: New Buspark (Gongabu), Kalanki, Soaltee Chowk, Kalimati
- `Kathmandu -> Pokhara` — 200 km, 600 min, boarding points: New Buspark (Gongabu), Kalanki, Soaltee Chowk; dropping points: Tourist Bus Park (Rashtriya Bank Chowk), Prithvi Chowk, Lakeside
- `Kathmandu -> Lumbini` — 280 km, 450 min, boarding points: New Buspark (Gongabu), Kalanki, Koteshwor; dropping points: Butwal Bus Park, Bhairahawa Bus Park, Lumbini Gate, Siddharthanagar
- `Lumbini -> Kathmandu` — 280 km, 450 min, boarding points: Lumbini Gate, Bhairahawa Bus Park, Butwal Bus Park; dropping points: New Buspark (Gongabu), Kalanki, Koteshwor

### Schedules
- `Pokhara -> Kathmandu` / `BA-1-KHA-5678` / `19:00` / NPR 2500
- `Pokhara -> Kathmandu` / `BA-2-KHA-9012` / `19:30` / NPR 1800
- `Kathmandu -> Pokhara` / `BA-3-KHA-3456` / `19:00` / NPR 2500
- `Kathmandu -> Lumbini` / `BA-1-KHA-5678` / `06:30` / NPR 2200
- `Kathmandu -> Lumbini` / `BA-2-KHA-9012` / `07:00` / NPR 1800
- `Lumbini -> Kathmandu` / `BA-3-KHA-3456` / `06:30` / NPR 2200

### Seeded admin
- One seeded admin user exists with a super-admin role and a password stored in the database by the seed script.
- Password value itself is intentionally omitted here to avoid sharing an actual credential.

---

## 5) Tests

No tests found.

---

## 6) .env example and env-var references (names only, no values)

### Backend / infrastructure env names
- PORT
- DATABASE_URL
- REDIS_URL
- REDIS_PRIVATE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- SEAT_HOLD_MINUTES
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- ESEWA_MERCHANT_CODE
- ESEWA_SECRET_KEY
- ESEWA_BASE_URL
- KHALTI_SECRET_KEY
- KHALTI_BASE_URL
- SMS_API_KEY
- WHATSAPP_API_TOKEN
- EMAIL_FROM
- SENDGRID_API_KEY
- API_PUBLIC_URL
- PACO_ENDPOINT
- PACO_API_KEY_NPR
- PACO_API_KEY
- PACO_API_KEY_USD
- PACO_MERCHANT_ID
- PACO_ENCRYPTION_KEY_ID
- PACO_MERCHANT_SIGNING_KEY
- PACO_ENCRYPTION_PUBLIC_KEY
- PACO_SIGNING_PUBLIC_KEY
- PACO_MERCHANT_DECRYPTION_KEY

### Frontend env names
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_SITE_ID
- NEXT_PUBLIC_CKEDITOR_LICENSE_KEY

### File references where names appear
- `bus-booking-backend/.env.example`
- `bus-booking-backend/.env`
- `docker-compose.yml`
- `storefront/.env.local.example`
- `storefront/.env.production`
- `storefront-chitwan/.env.local.example`
- `storefront-chitwan/.env.production`
- `storefront-lumbini/.env.local.example`
- `storefront-lumbini/.env.production`
- `admin-panel/.env.production`

---

## 7) TODO, FIXME, and HACK comments found in the codebase

No TODO, FIXME, or HACK comments were found in the repository scan.

---

## 8) Last 20 git commit messages with dates

```text
2026-09-07  e0dca9a feat: add site-scoped API and storefront middleware
2026-09-07  2db88df chore: add CMS and booking seed data
2026-09-07  8c76ee1 fix: frontend API header propagation for X-Site-Id
2026-09-07  19fe9ad feat: add admin panel dashboard routes and fleet UI
2026-09-07  5d2a11e feat: add payment callback handling and card gateway support
2026-09-07  60c1b41 refactor: reorganize backend modules by feature area
2026-09-07  77d7e1c feat: add Prisma models for sites, schedules, and trip inventory
2026-09-07  a82be1d chore: initial scaffold for storefronts and admin panel
2026-09-06  6cb3bdb docs: add architecture and deployment notes
2026-09-06  1e55bd3 fix: guard JWT auth and role checks for staff endpoints
2026-09-06  caaf3fe feat: add payment providers for eSewa and Khalti
2026-09-06  40dbcca feat: add route search and seat availability API
2026-09-05  c246fb9 build: configure docker-compose for Postgres/Redis/backend/frontend
2026-09-05  9d4dcbc fix: seed script for Pokhara and Lumbini sites
2026-09-05  737af41 chore: add infrastructure template for ECS+ALB
2026-09-05  3f79514 feat: add NestJS backend foundation and Prisma service
2026-09-05  1237a2c chore: initialize repo and workspace structure
2026-09-04  018d5ce docs: update README for service installation steps
2026-09-04  0d2dba8 init: basic storefront landing pages
```

---

## 9) Site / tenant scoping code (`X-Site-Id` handling)

### backend: `bus-booking-backend/src/common/decorators/site-id.decorator.ts`
```ts
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

// Every storefront sends its identity explicitly via X-Site-Id — never
// inferred from Origin/Referer, which is easy to spoof or misconfigure.
// Usage: findTrips(@SiteId() siteId: string) { ... }
export const SiteId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const siteId = request.headers['x-site-id'];
  if (!siteId) {
    throw new BadRequestException('Missing X-Site-Id header');
  }
  return siteId;
});
```

### storefront middleware: `storefront/src/middleware.ts`
```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // In production, this would be a lookup against a fast KV store (like Vercel KV or Upstash)
  // or a cached fetch to our backend to map `host` -> `siteId`.
  // For local development, we default to site ID 1 (the first seeded site).
  let siteId = '1'; 

  // Example mappings:
  // if (host.includes('bus-brand-a.com')) siteId = '1';
  // if (host.includes('bus-brand-b.com')) siteId = '2';

  // Clone headers and inject the resolved tenant ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-id', siteId);

  // Return the response with the modified headers so Server Components can read it
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Apply to all routes except static assets and API routes
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### storefront API interceptor: `storefront/src/lib/api.ts`
```ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

api.interceptors.request.use((config) => {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'pokhara-travels';
  config.headers['X-Site-Id'] = siteId;
  return config;
});
```

### admin-panel API fetch helper: `admin-panel/src/lib/api.ts`
```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function api<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    let finalToken = token;
    let siteId = null;
    if (typeof window !== 'undefined') {
        if (!finalToken) finalToken = localStorage.getItem('cms_token') || undefined;
        siteId = localStorage.getItem('cms_site_id');
    }

    if (finalToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${finalToken}`;
    }

    if (siteId) {
        (headers as Record<string, string>)['x-site-id'] = siteId;
    }

    const res = await fetch(`${API_URL}${path}`, { headers, ...rest });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
}
```

---

## Final notes

- The repository has a multi-site architecture where each storefront is expected to send a site identifier in `X-Site-Id`.
- The current seed data includes two branded storefront sites: `pokhara-travels` and `ktm-lumbini-services`.
- The backend uses a global prefix of `/api/v1` and the project is organized around NestJS services, multiple Next.js storefronts, and an admin console.
- Secrets have been redacted in shared output as required.
