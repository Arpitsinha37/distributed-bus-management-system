import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/seo/JsonLd';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});

const SITE_URL = 'https://pokharatokathmandutouristbusbooking.com';

export const metadata: Metadata = {
  title: {
    default: 'Pokhara to Kathmandu Night Bus Ticket – VIP Sofa from Rs 1,200',
    template: '%s | Pokhara Travels'
  },
  description:
    'Book Pokhara to Kathmandu VIP sofa night bus online. Departs 7:00 PM from Tourist Bus Park, arrives ~5:30 AM. Choose your seat, pay easily. From Rs 1,200.',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pokhara to Kathmandu Night Bus Ticket – VIP Sofa from Rs 1,200',
    description: 'Book your VIP sofa night bus online. Departs 7:00 PM, arrives ~5:30 AM. Real-time seat selection, instant confirmation. Pay with eSewa, Khalti, or card.',
    url: SITE_URL,
    siteName: 'Pokhara Travels',
    locale: 'en_NP',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'Pokhara to Kathmandu VIP Sofa Night Bus – Book Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokhara to Kathmandu Night Bus Ticket – VIP Sofa from Rs 1,200',
    description: 'Book your VIP sofa night bus online. Departs 7:00 PM, arrives ~5:30 AM. Real-time seat selection, instant confirmation.',
    images: [`${SITE_URL}/og-default.png`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ]
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} font-body flex flex-col min-h-screen bg-slate-50`}
      >
        <JsonLd />
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
