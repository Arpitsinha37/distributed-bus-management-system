'use client';
import dynamic from 'next/dynamic';

const Tours = dynamic(() => import('@/pages-nrt/Tours'), { ssr: false });

export default function ToursPage() {
  return <Tours />;
}
