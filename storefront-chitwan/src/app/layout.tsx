import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

export const metadata: Metadata = {
  title: {
    default: 'Pokhara Travels | Premium Bus Booking — Pokhara to Kathmandu',
    template: '%s | Pokhara Travels'
  },
  description:
    'Book your luxury bus journey from Pokhara to Kathmandu with real-time seat selection, live tracking, and instant confirmation. Travel through the Himalayas in comfort.',
  openGraph: {
    title: 'Pokhara Travels | Premium Bus Booking',
    description: 'Book your luxury bus journey with real-time seat selection, live tracking, and instant confirmation.',
    url: 'https://pokharatokathmandutouristbusbooking.com',
    siteName: 'Pokhara Travels',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pokhara Travels | Premium Bus Booking',
    description: 'Book your luxury bus journey with real-time seat selection, live tracking, and instant confirmation.',
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
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
