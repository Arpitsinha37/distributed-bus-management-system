'use client';
import dynamic from 'next/dynamic';

const PassengerDetails = dynamic(() => import('@/pages-nrt/PassengerDetails'), { ssr: false });

export default function PassengerDetailsPage() {
  return <PassengerDetails />;
}
