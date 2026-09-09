'use client';
import dynamic from 'next/dynamic';

const DestinationDetail = dynamic(() => import('@/pages-nrt/DestinationDetail'), { ssr: false });

export default function DestinationPage() {
  return <DestinationDetail />;
}
