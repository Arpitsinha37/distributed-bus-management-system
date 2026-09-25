'use client';
import dynamic from 'next/dynamic';

const Tours = dynamic(() => import('@/pages-nrt/Tours'));

export default function ToursPage() {
  return <Tours />;
}
