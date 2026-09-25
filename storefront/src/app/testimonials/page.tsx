'use client';
import dynamic from 'next/dynamic';

const Testimonials = dynamic(() => import('@/pages-nrt/Testimonials'));

export default function TestimonialsPage() {
  return <Testimonials />;
}
