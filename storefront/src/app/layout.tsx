import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500', '700'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
const mono = Space_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'SpeedX - Bus Booking',
  description: 'Search buses and book your seat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-gray-50 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 w-full max-w-5xl mx-auto">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
