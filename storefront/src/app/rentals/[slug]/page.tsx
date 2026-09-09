'use client';
import dynamic from 'next/dynamic';

const RentalDetail = dynamic(() => import('@/pages-nrt/RentalDetail'), { ssr: false });

export default function RentalDetailPage() {
  return <RentalDetail />;
}
