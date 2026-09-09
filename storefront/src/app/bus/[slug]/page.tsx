'use client';
import dynamic from 'next/dynamic';

const BusServiceDetail = dynamic(() => import('@/pages-nrt/BusServiceDetail'), { ssr: false });

export default function BusServicePage() {
  return <BusServiceDetail />;
}
