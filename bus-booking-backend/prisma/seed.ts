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

  // ── Lumbini Site ──────────────────────────────────────────
  const lumbiniSite = await prisma.site.upsert({
    where: { slug: 'ktm-lumbini-services' },
    update: {},
    create: {
      slug: 'ktm-lumbini-services',
      name: 'Lumbini Express',
      domain: 'lumbiniexpress.com',
      currency: 'NPR',
      contactPhone: '+977-9812345678',
      contactEmail: 'info@lumbiniexpress.com',
      themeColor: '#D4831E',
    },
  });
  console.log(`✅ Site: ${lumbiniSite.name} (slug: ${lumbiniSite.slug})`);

  // Link admin to Lumbini site
  await prisma.staffSite.upsert({
    where: { staffId_siteId: { staffId: admin.id, siteId: lumbiniSite.id } },
    update: {},
    create: { staffId: admin.id, siteId: lumbiniSite.id },
  });

  // ── Lumbini Routes ────────────────────────────────────────
  let routeKtmLum = await prisma.route.findFirst({
    where: { originCity: 'Kathmandu', destinationCity: 'Lumbini' },
  });
  if (!routeKtmLum) {
    routeKtmLum = await prisma.route.create({
      data: {
        originCity: 'Kathmandu',
        destinationCity: 'Lumbini',
        distanceKm: 280,
        durationMinutes: 450, // ~7.5 hours
        boardingPoints: [
          'New Buspark (Gongabu)',
          'Kalanki',
          'Koteshwor',
        ],
        droppingPoints: [
          'Butwal Bus Park',
          'Bhairahawa Bus Park',
          'Lumbini Gate',
          'Siddharthanagar',
        ],
      },
    });
  }
  console.log(`✅ Route: ${routeKtmLum.originCity} → ${routeKtmLum.destinationCity}`);

  let routeLumKtm = await prisma.route.findFirst({
    where: { originCity: 'Lumbini', destinationCity: 'Kathmandu' },
  });
  if (!routeLumKtm) {
    routeLumKtm = await prisma.route.create({
      data: {
        originCity: 'Lumbini',
        destinationCity: 'Kathmandu',
        distanceKm: 280,
        durationMinutes: 450,
        boardingPoints: [
          'Lumbini Gate',
          'Bhairahawa Bus Park',
          'Butwal Bus Park',
        ],
        droppingPoints: [
          'New Buspark (Gongabu)',
          'Kalanki',
          'Koteshwor',
        ],
      },
    });
  }
  console.log(`✅ Route: ${routeLumKtm.originCity} → ${routeLumKtm.destinationCity}`);

  // ── Lumbini Schedules ─────────────────────────────────────
  const lumbiniSchedules = [
    { routeId: routeKtmLum.id, busId: bus1.id, departureTime: '06:30', fare: 2200, label: 'KTM→Lumbini VIP 6:30AM' },
    { routeId: routeKtmLum.id, busId: bus2.id, departureTime: '07:00', fare: 1800, label: 'KTM→Lumbini Deluxe 7AM' },
    { routeId: routeLumKtm.id, busId: bus3.id, departureTime: '06:30', fare: 2200, label: 'Lumbini→KTM VIP 6:30AM' },
  ];

  for (const s of lumbiniSchedules) {
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

  // ── Lumbini CMS Content ───────────────────────────────────
  const lumbiniTestimonials = [
    { name: 'Anjali Sharma', role: 'Kathmandu', content: 'The Lumbini Express made our pilgrimage so comfortable. VIP sofa seats, AC, and the driver was experienced and careful. Highly recommend for families.', rating: 5 },
    { name: 'Takeshi Yamamoto', role: 'Japan (Buddhist Pilgrim)', content: 'As a pilgrim visiting Buddha\'s birthplace, I was impressed by the service quality. The journey was smooth and we arrived right at Lumbini Gate.', rating: 5 },
    { name: 'Binod Chaudhary', role: 'Bhairahawa', content: 'I travel this route every week for work. The online booking is fast and the buses are always on time. Best service on the KTM-Lumbini highway.', rating: 4 },
  ];

  for (const t of lumbiniTestimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name, siteId: lumbiniSite.id } });
    if (!existing) {
      await prisma.testimonial.create({ data: { ...t, siteId: lumbiniSite.id } });
    }
    console.log(`✅ Testimonial (Lumbini): ${t.name}`);
  }

  const lumFaqs = [
    { question: 'What time does the Lumbini bus depart?', answer: 'Our buses depart at 6:30 AM and 7:00 AM from New Buspark (Gongabu), Kathmandu. The journey takes approximately 7-8 hours.' },
    { question: 'Where does the bus drop in Lumbini?', answer: 'The bus drops passengers at Butwal Bus Park, Bhairahawa Bus Park, Lumbini Gate, and Siddharthanagar.' },
    { question: 'Can I cancel my Lumbini booking?', answer: 'Yes, you can cancel up to 24 hours before departure for an 80% refund. Cancellations within 24 hours receive a 50% refund.' },
    { question: 'Is the bus air-conditioned?', answer: 'Yes, all our buses on the Kathmandu-Lumbini route are fully air-conditioned with VIP sofa seats, USB charging, and Wi-Fi.' },
  ];

  for (const f of lumFaqs) {
    const existing = await prisma.fAQ.findFirst({ where: { question: f.question, siteId: lumbiniSite.id } });
    if (!existing) {
      await prisma.fAQ.create({ data: { ...f, siteId: lumbiniSite.id, order: lumFaqs.indexOf(f) } });
    }
    console.log(`✅ FAQ (Lumbini): ${f.question.substring(0, 40)}...`);
  }

  await prisma.siteSetting.upsert({
    where: { siteId: lumbiniSite.id },
    update: {},
    create: {
      siteId: lumbiniSite.id,
      aboutUsText: 'Lumbini Express is a premium bus service connecting Kathmandu and Lumbini — the Birthplace of Lord Buddha. We operate VIP Sofa and Deluxe coaches equipped with modern amenities for a comfortable day journey through the Terai plains.',
      contactInfo: {
        phone: '+977-9812345678',
        email: 'info@lumbiniexpress.com',
        address: 'New Bus Park (Gongabu), Kathmandu',
        facebookUrl: 'https://facebook.com/lumbiniexpress',
        instagramUrl: 'https://instagram.com/lumbiniexpress',
      },
      termsText: 'Standard terms and conditions apply. Passengers must carry valid ID. The bus operator reserves the right to cancel trips due to weather or road conditions.',
      privacyText: 'We collect your personal information solely for booking purposes. Your data is never shared with third parties.',
    },
  });
  console.log(`✅ Lumbini Site Settings configured`);

  // ── Chitwan Site ──────────────────────────────────────────
  const chitwanSite = await prisma.site.upsert({
    where: { slug: 'chitwan-travels' },
    update: {},
    create: {
      slug: 'chitwan-travels',
      name: 'Chitwan Safaris',
      domain: 'chitwantravels.com',
      currency: 'NPR',
      contactPhone: '+977-9811112222',
      contactEmail: 'info@chitwantravels.com',
      themeColor: '#2E8B57',
    },
  });
  console.log(`✅ Site: ${chitwanSite.name} (slug: ${chitwanSite.slug})`);

  await prisma.staffSite.upsert({
    where: { staffId_siteId: { staffId: admin.id, siteId: chitwanSite.id } },
    update: {},
    create: { staffId: admin.id, siteId: chitwanSite.id },
  });

  // ── Chitwan Routes ────────────────────────────────────────
  let routeKtmChi = await prisma.route.findFirst({
    where: { originCity: 'Kathmandu', destinationCity: 'Chitwan' },
  });
  if (!routeKtmChi) {
    routeKtmChi = await prisma.route.create({
      data: {
        originCity: 'Kathmandu',
        destinationCity: 'Chitwan',
        distanceKm: 150,
        durationMinutes: 300,
        boardingPoints: ['New Buspark (Gongabu)', 'Kalanki', 'Koteshwor'],
        droppingPoints: ['Sauraha Bus Park', 'Narayangarh', 'Bharatpur'],
      },
    });
  }
  console.log(`✅ Route: ${routeKtmChi.originCity} → ${routeKtmChi.destinationCity}`);

  let routeChiKtm = await prisma.route.findFirst({
    where: { originCity: 'Chitwan', destinationCity: 'Kathmandu' },
  });
  if (!routeChiKtm) {
    routeChiKtm = await prisma.route.create({
      data: {
        originCity: 'Chitwan',
        destinationCity: 'Kathmandu',
        distanceKm: 150,
        durationMinutes: 300,
        boardingPoints: ['Sauraha Bus Park', 'Bharatpur', 'Narayangarh'],
        droppingPoints: ['New Buspark (Gongabu)', 'Kalanki', 'Koteshwor'],
      },
    });
  }
  console.log(`✅ Route: ${routeChiKtm.originCity} → ${routeChiKtm.destinationCity}`);

  // ── Chitwan Schedules ─────────────────────────────────────
  const chitwanSchedules = [
    { routeId: routeKtmChi.id, busId: bus1.id, departureTime: '07:00', fare: 1500, label: 'KTM→Chitwan VIP 7:00AM' },
    { routeId: routeChiKtm.id, busId: bus2.id, departureTime: '07:30', fare: 1200, label: 'Chitwan→KTM Deluxe 7:30AM' },
  ];

  for (const s of chitwanSchedules) {
    const existing = await prisma.schedule.findFirst({
      where: { routeId: s.routeId, busId: s.busId, departureTime: s.departureTime },
    });
    if (!existing) {
      await prisma.schedule.create({
        data: {
          routeId: s.routeId,
          busId: s.busId,
          departureTime: s.departureTime,
          daysOfWeek: [],
          fare: s.fare,
        },
      });
    }
    console.log(`✅ Schedule: ${s.label} — NPR ${s.fare}`);
  }

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
  console.log(`   Sites:       pokhara-travels, ktm-lumbini-services, chitwan-travels`);
  console.log(`   Routes:      Pokhara ↔ KTM, KTM ↔ Lumbini, KTM ↔ Chitwan`);
  console.log(`   Buses:       3 (2× VIP Sofa, 1× Super Deluxe)`);
  console.log(`   Schedules:   8 departures`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
