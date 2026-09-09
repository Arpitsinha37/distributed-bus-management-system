'use client';
import dynamic from 'next/dynamic';

const Rentals = dynamic(() => import('@/pages-nrt/Rentals'), { ssr: false });

export default function RentalsPage() {
  return <Rentals />;
}
