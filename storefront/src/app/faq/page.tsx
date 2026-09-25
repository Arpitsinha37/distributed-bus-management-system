'use client';
import dynamic from 'next/dynamic';

const FAQ = dynamic(() => import('@/pages-nrt/FAQ'));

export default function FAQPage() {
  return <FAQ />;
}
