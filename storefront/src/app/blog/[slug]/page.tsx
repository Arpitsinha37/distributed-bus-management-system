'use client';
import dynamic from 'next/dynamic';

const BlogPost = dynamic(() => import('@/pages-nrt/BlogPost'), { ssr: false });

export default function BlogPostPage() {
  return <BlogPost />;
}
