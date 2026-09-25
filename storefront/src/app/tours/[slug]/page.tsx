'use client';
import dynamic from 'next/dynamic';

const TourPackageDetail = dynamic(() => import('@/pages-nrt/TourPackageDetail'));

export default function TourDetailPage() {
  return <TourPackageDetail />;
}
