'use client';
import dynamic from 'next/dynamic';

const AdventureActivityDetails = dynamic(() => import('@/pages-nrt/AdventureActivityDetails'));

export default function AdventureActivityPage() {
  return <AdventureActivityDetails />;
}
