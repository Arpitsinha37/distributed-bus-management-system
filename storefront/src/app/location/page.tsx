'use client';
import dynamic from 'next/dynamic';

const Location = dynamic(() => import('@/pages-nrt/Location'), { ssr: false });

export default function LocationPage() {
  return <Location />;
}
