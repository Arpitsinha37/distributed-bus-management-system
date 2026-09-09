'use client';
import dynamic from 'next/dynamic';

const AdventureActivityDetails = dynamic(() => import('@/pages-nrt/AdventureActivityDetails'), { ssr: false });

export default function AdventureActivityPage() {
  return <AdventureActivityDetails />;
}
