/**
 * react-helmet-async compatibility shim for Next.js.
 * NRT pages use <Helmet> for SEO. In Next.js, we use next/head or metadata.
 * This shim renders helmet content as a no-op in the client.
 */
'use client';

import React from 'react';

export function Helmet({ children }: { children?: React.ReactNode }) {
  // In Next.js, meta tags are handled by metadata exports or next/head
  // This is a no-op wrapper so NRT pages don't break
  return null;
}

export function HelmetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default Helmet;
