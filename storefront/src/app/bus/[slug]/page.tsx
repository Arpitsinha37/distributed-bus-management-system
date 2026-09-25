'use client';
import dynamic from 'next/dynamic';

const BusServiceDetail = dynamic(() => import('@/pages-nrt/BusServiceDetail'));

export default function BusDetailPage() {
  return <BusServiceDetail />;
}
