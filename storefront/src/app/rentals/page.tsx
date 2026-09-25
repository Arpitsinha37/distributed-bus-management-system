'use client';
import dynamic from 'next/dynamic';

const Rentals = dynamic(() => import('@/pages-nrt/Rentals'));

export default function RentalsPage() {
  return <Rentals />;
}
