export default function JsonLd() {
  const SITE_URL = 'https://pokharatokathmandutouristbusbooking.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Pokhara Travels',
    alternateName: 'New Road Travels',
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    image: `${SITE_URL}/og-default.png`,
    description:
      'Book Pokhara to Kathmandu VIP sofa night bus tickets online. Real-time seat selection, instant confirmation, and multiple payment options.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tourist Bus Park, Rashtriya Bank Chowk',
      addressLocality: 'Pokhara',
      addressRegion: 'Gandaki Province',
      addressCountry: 'NP',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nepal',
    },
    priceRange: 'Rs 1,200–2,500',
    currenciesAccepted: 'NPR',
    paymentAccepted: 'eSewa, Khalti, Fonepay, Credit Card, Cash',
    sameAs: [
      // Add your social media links here
      // 'https://www.facebook.com/yourpage',
      // 'https://www.instagram.com/yourpage',
    ],
  };

  const busTripSchema = {
    '@context': 'https://schema.org',
    '@type': 'BusTrip',
    name: 'Pokhara to Kathmandu Night Tourist Bus',
    description:
      'Overnight VIP sofa bus from Tourist Bus Park Pokhara to Kathmandu. Departs 7:00 PM, arrives approximately 5:30 AM with drop-offs at Thankot, Kalanki, Swayambhu, Balaju, and Sorakhutte.',
    departureTime: '19:00',
    arrivalTime: '05:30',
    departureBusStop: {
      '@type': 'BusStop',
      name: 'Tourist Bus Park',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rashtriya Bank Chowk',
        addressLocality: 'Pokhara',
        addressRegion: 'Gandaki Province',
        addressCountry: 'NP',
      },
    },
    arrivalBusStop: {
      '@type': 'BusStop',
      name: 'Sorakhutte Bus Stop',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kathmandu',
        addressRegion: 'Bagmati Province',
        addressCountry: 'NP',
      },
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Pokhara Travels',
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: '1200',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      url: SITE_URL,
      validFrom: '2026-01-01',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What time does the Pokhara to Kathmandu night bus depart?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The night tourist bus departs at 7:00 PM from Tourist Bus Park (Rashtriya Bank Chowk), Pokhara. Please arrive by 6:45 PM for boarding.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does the Pokhara to Kathmandu bus ticket cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ticket prices start from Rs 1,200 for standard seats. VIP Sofa 2+1 configuration seats cost more. Exact fares depend on the bus type and season.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where does the night bus drop off in Kathmandu?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The bus arrives in Kathmandu around 5:30 AM with drop-off points at Thankot, Kalanki, Swayambhu, Balaju, and Sorakhutte.',
        },
      },
      {
        '@type': 'Question',
        name: 'What payment methods are accepted for online bus booking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We accept eSewa, Khalti, Fonepay, and international credit/debit cards for online bookings. Cash payment is available at the counter.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long is the Pokhara to Kathmandu bus journey?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The night bus journey covers approximately 200 km via Prithvi Highway. The total journey time is around 10 hours including a scheduled rest stop, as buses travel at reduced speed for safety during night hours.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of buses are available on the Pokhara to Kathmandu route?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We operate multiple bus types including VIP Sofa (2+1 configuration), Deluxe (2+2 configuration), and Microbuses. Amenities vary by bus type and may include AC, WiFi, charging ports, blankets, reclining seats, and onboard toilet.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel or change my bus ticket after booking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, cancellations and changes are possible subject to our cancellation policy. Please visit our cancellation page or contact us via WhatsApp for details.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the Pokhara to Kathmandu night bus safe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Our buses have experienced drivers who are familiar with the Prithvi Highway. Buses travel at reduced speed at night for safety, and there is a scheduled rest stop. All buses are regularly maintained and inspected.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(busTripSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
