'use client';
import dynamic from 'next/dynamic';

const Booking = dynamic(() => import('@/pages-nrt/Booking'), { ssr: false });

export default function BookingPage() {
  return <Booking />;
}
