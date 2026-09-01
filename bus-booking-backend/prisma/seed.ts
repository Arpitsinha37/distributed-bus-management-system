import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚌 Seeding bus booking database...\n');

  // ── 1. Super Admin ────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin@123', 10);
  const admin = await prisma.staff.upsert({
    where: { email: 'admin@pokharatravels.com' },
    update: {},
    create: {
      name: 'Arpit Sinha',
      email: 'admin@pokharatravels.com',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✅ Admin: ${admin.email} / password: admin@123`);

  // ── 2. Site (Storefront) ──────────────────────────────────
  const site = await prisma.site.upsert({
    where: { slug: 'pokhara-travels' },
    update: {},
    create: {
      slug: 'pokhara-travels',
      name: 'Pokhara Travels',
      domain: 'pokharatravels.com',
      currency: 'NPR',
      contactPhone: '+977-9800000000',
      contactEmail: 'info@pokharatravels.com',
      themeColor: '#E31837',
    },
  });
  console.log(`✅ Site: ${site.name} (slug: ${site.slug})`);

  // Link admin to site
  await prisma.staffSite.upsert({
    where: { staffId_siteId: { staffId: admin.id, siteId: site.id } },
    update: {},
    create: { staffId: admin.id, siteId: site.id },
  });

  // ── 3. Seat Layouts ───────────────────────────────────────

  // VIP Sofa 2/1 layout (21 seats: 7 rows × 3 seats per row)
  let sofaLayout = await prisma.seatLayout.findFirst({ where: { name: 'VIP Sofa 2/1' } });
  if (!sofaLayout) {
    const seats = [];
    for (let row = 0; row < 7; row++) {
      const rowLetter = String.fromCharCode(65 + row); // A, B, C, ...
      // Left side: 2 seats (window + aisle)
      seats.push({ number: `${rowLetter}1`, type: 'window' });
      seats.push({ number: `${rowLetter}2`, type: 'aisle' });
      // Right side: 1 seat (window — the solo luxury seat)
      seats.push({ number: `${rowLetter}3`, type: 'window' });
    }
    sofaLayout = await prisma.seatLayout.create({
      data: {
        name: 'VIP Sofa 2/1',
        totalSeats: 21,
        layoutJson: {
          rows: 7,
          columns: 3,
          pattern: '2+1',
          seats,
        },
      },
    });
  }
  console.log(`✅ Seat Layout: ${sofaLayout.name} (${sofaLayout.totalSeats} seats)`);

  // Standard 2/2 layout (32 seats: 8 rows × 4 seats per row)
  let standardLayout = await prisma.seatLayout.findFirst({ where: { name: 'Standard 2/2' } });
  if (!standardLayout) {
    const seats = [];
    for (let row = 0; row < 8; row++) {
      const rowLetter = String.fromCharCode(65 + row);
      seats.push({ number: `${rowLetter}1`, type: 'window' });
      seats.push({ number: `${rowLetter}2`, type: 'aisle' });
      seats.push({ number: `${rowLetter}3`, type: 'aisle' });
      seats.push({ number: `${rowLetter}4`, type: 'window' });
    }
    standardLayout = await prisma.seatLayout.create({
      data: {
        name: 'Standard 2/2',
        totalSeats: 32,
        layoutJson: {
          rows: 8,
          columns: 4,
          pattern: '2+2',
          seats,
        },
      },
    });
  }
  console.log(`✅ Seat Layout: ${standardLayout.name} (${standardLayout.totalSeats} seats)`);

  // ── 4. Buses ──────────────────────────────────────────────

  let bus1 = await prisma.bus.findUnique({ where: { registrationNo: 'BA-1-KHA-5678' } });
  if (!bus1) {
    bus1 = await prisma.bus.create({
      data: {
        registrationNo: 'BA-1-KHA-5678',
        type: 'VIP Sofa',
        brand: 'Ashok Leyland',
        model: 'Viking',
        manufacturingYear: 2023,
        amenities: ['wifi', 'charging', 'blanket', 'ac', 'water'],
        seatLayoutId: sofaLayout.id,
        images: ['/images/vip-sofa-bus.jpg'],
      },
    });
  }
  console.log(`✅ Bus: ${bus1.type} (${bus1.registrationNo})`);

  let bus2 = await prisma.bus.findUnique({ where: { registrationNo: 'BA-2-KHA-9012' } });
  if (!bus2) {
    bus2 = await prisma.bus.create({
      data: {
        registrationNo: 'BA-2-KHA-9012',
        type: 'Super Deluxe',
        brand: 'Tata',
        model: 'Starbus Ultra',
        manufacturingYear: 2022,
        amenities: ['wifi', 'charging', 'ac'],
        seatLayoutId: standardLayout.id,
        images: ['/images/Sofa-Bus-Nepal-2.jpg'],
      },
    });
  }
  console.log(`✅ Bus: ${bus2.type} (${bus2.registrationNo})`);

  let bus3 = await prisma.bus.findUnique({ where: { registrationNo: 'BA-3-KHA-3456' } });
  if (!bus3) {
    bus3 = await prisma.bus.create({
      data: {
        registrationNo: 'BA-3-KHA-3456',
        type: 'VIP Sofa',
        brand: 'Ashok Leyland',
        model: 'Viking',
        manufacturingYear: 2024,
        amenities: ['wifi', 'charging', 'blanket', 'ac', 'water', 'snacks'],
        seatLayoutId: sofaLayout.id,
        images: ['/images/vip-sofa-bus.jpg'],
      },
    });
  }
  console.log(`✅ Bus: ${bus3.type} (${bus3.registrationNo})`);

  // ── 5. Routes ─────────────────────────────────────────────

  let routePokKtm = await prisma.route.findFirst({
    where: { originCity: 'Pokhara', destinationCity: 'Kathmandu' },
  });
  if (!routePokKtm) {
    routePokKtm = await prisma.route.create({
      data: {
        originCity: 'Pokhara',
        destinationCity: 'Kathmandu',
        distanceKm: 200,
        durationMinutes: 600, // ~10 hours night journey
        boardingPoints: [
          'Tourist Bus Park (Rashtriya Bank Chowk)',
          'Prithvi Chowk',
          'Narayangarh (Bypass)',
        ],
        droppingPoints: [
          'New Buspark (Gongabu)',
          'Kalanki',
          'Soaltee Chowk',
          'Kalimati',
        ],
      },
    });
  }
  console.log(`✅ Route: ${routePokKtm.originCity} → ${routePokKtm.destinationCity}`);

  let routeKtmPok = await prisma.route.findFirst({
    where: { originCity: 'Kathmandu', destinationCity: 'Pokhara' },
  });
  if (!routeKtmPok) {
    routeKtmPok = await prisma.route.create({
      data: {
        originCity: 'Kathmandu',
        destinationCity: 'Pokhara',
        distanceKm: 200,
        durationMinutes: 600,
        boardingPoints: [
          'New Buspark (Gongabu)',
          'Kalanki',
          'Soaltee Chowk',
        ],
        droppingPoints: [
          'Tourist Bus Park (Rashtriya Bank Chowk)',
          'Prithvi Chowk',
          'Lakeside',
        ],
      },
    });
  }
  console.log(`✅ Route: ${routeKtmPok.originCity} → ${routeKtmPok.destinationCity}`);

  // ── 6. Schedules ──────────────────────────────────────────

  // Pokhara → Kathmandu Night Services
  const schedules = [
    { routeId: routePokKtm.id, busId: bus1.id, departureTime: '19:00', fare: 2500, label: 'Pokhara→KTM VIP 7PM' },
    { routeId: routePokKtm.id, busId: bus2.id, departureTime: '19:30', fare: 1800, label: 'Pokhara→KTM Deluxe 7:30PM' },
    { routeId: routeKtmPok.id, busId: bus3.id, departureTime: '19:00', fare: 2500, label: 'KTM→Pokhara VIP 7PM' },
  ];

  for (const s of schedules) {
    const existing = await prisma.schedule.findFirst({
      where: { routeId: s.routeId, busId: s.busId, departureTime: s.departureTime },
    });
    if (!existing) {
      await prisma.schedule.create({
        data: {
          routeId: s.routeId,
          busId: s.busId,
          departureTime: s.departureTime,
          daysOfWeek: [], // runs every day
          fare: s.fare,
        },
      });
    }
    console.log(`✅ Schedule: ${s.label} — NPR ${s.fare}`);
  }

  // ── 7. Crew Members ───────────────────────────────────────

  const crewData = [
    { name: 'Ram Bahadur', phone: '+977-9801111111', role: 'DRIVER' as const, licenseNo: 'DL-12345' },
    { name: 'Shyam Thapa', phone: '+977-9802222222', role: 'HELPER' as const },
    { name: 'Hari Prasad', phone: '+977-9803333333', role: 'DRIVER' as const, licenseNo: 'DL-67890' },
  ];

  for (const c of crewData) {
    const existing = await prisma.crewMember.findUnique({ where: { phone: c.phone } });
    if (!existing) {
      await prisma.crewMember.create({ data: c });
    }
    console.log(`✅ Crew: ${c.name} (${c.role})`);
  }

  // ── 8. CMS Content ────────────────────────────────────────

  // Testimonials
  const testimonials = [
    { name: 'Aarav Sharma', role: 'Kathmandu', content: 'Amazing VIP sofa bus! The seats recline fully and I slept the entire way. Arrived fresh at 5:30 AM.', rating: 5 },
    { name: 'Priya Patel', role: 'Pokhara', content: 'Best night bus service in Nepal. WiFi worked throughout, USB charging was convenient. Will definitely book again.', rating: 5 },
    { name: 'Marco Rossi', role: 'Italy (Tourist)', content: 'As a tourist, I was impressed by the comfort level. The booking process was smooth and the bus was clean and modern.', rating: 4 },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name, siteId: site.id } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, siteId: site.id } });
    }
    console.log(`✅ Testimonial: ${t.name}`);
  }

  // FAQs
  const faqs = [
    { question: 'What time does the night bus depart?', answer: 'Our night buses depart at 7:00 PM and 7:30 PM from Tourist Bus Park, Pokhara. The journey takes approximately 10 hours.' },
    { question: 'What is a VIP Sofa seat?', answer: 'VIP Sofa seats are premium 2/1 configuration seats that recline up to 160°. Each seat has individual USB charging, blanket, and water bottle.' },
    { question: 'Can I cancel my booking?', answer: 'Yes, you can cancel up to 24 hours before departure for an 80% refund. Cancellations within 24 hours receive a 50% refund.' },
    { question: 'Where does the bus drop in Kathmandu?', answer: 'The bus drops passengers at New Buspark (Gongabu), Kalanki, Soaltee Chowk, and Kalimati.' },
  ];

  for (const f of faqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question, siteId: site.id } });
    if (!existing) {
      await prisma.fAQ.create({ data: { ...f, siteId: site.id, order: faqs.indexOf(f) } });
    }
    console.log(`✅ FAQ: ${f.question.substring(0, 40)}...`);
  }

  // Site Settings
  await prisma.siteSetting.upsert({
    where: { siteId: site.id },
    update: {},
    create: {
      siteId: site.id,
      aboutUsText: 'Pokhara Travels is a premium night bus service connecting Pokhara and Kathmandu. We operate VIP Sofa and Super Deluxe coaches equipped with modern amenities for a comfortable overnight journey through the Himalayas.',
      contactInfo: {
        phone: '+977-9800000000',
        email: 'info@pokharatravels.com',
        address: 'Tourist Bus Park, Rashtriya Bank Chowk, Pokhara',
        facebookUrl: 'https://facebook.com/pokharatravels',
        instagramUrl: 'https://instagram.com/pokharatravels',
      },
      termsText: 'Standard terms and conditions apply. Passengers must carry valid ID. The bus operator reserves the right to cancel trips due to weather or road conditions.',
      privacyText: 'We collect your personal information solely for booking purposes. Your data is never shared with third parties.',
    },
  });
  console.log(`✅ Site Settings configured`);

  // Cancellation Policy
  const policies = [
    { hoursBeforeDep: 24, refundPercent: 80 },
    { hoursBeforeDep: 12, refundPercent: 50 },
    { hoursBeforeDep: 0, refundPercent: 0 },
  ];
  for (const p of policies) {
    const existing = await prisma.cancellationPolicy.findFirst({ where: { hoursBeforeDep: p.hoursBeforeDep } });
    if (!existing) {
      await prisma.cancellationPolicy.create({ data: p });
    }
    console.log(`✅ Cancellation Policy: ${p.hoursBeforeDep}h before → ${p.refundPercent}% refund`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`\n📋 Summary:`);
  console.log(`   Admin Login: admin@pokharatravels.com / admin@123`);
  console.log(`   Site Slug:   pokhara-travels`);
  console.log(`   Routes:      Pokhara ↔ Kathmandu (both directions)`);
  console.log(`   Buses:       3 (2× VIP Sofa, 1× Super Deluxe)`);
  console.log(`   Schedules:   3 nightly departures`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
