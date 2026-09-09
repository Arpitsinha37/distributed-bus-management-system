'use client';
import dynamic from 'next/dynamic';

const Testimonials = dynamic(() => import('@/pages-nrt/Testimonials'), { ssr: false });

export default function TestimonialsPage() {
  return <Testimonials />;
}
