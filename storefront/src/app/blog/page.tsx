'use client';
import dynamic from 'next/dynamic';

const Blog = dynamic(() => import('@/pages-nrt/Blog'));

export default function BlogPage() {
  return <Blog />;
}
