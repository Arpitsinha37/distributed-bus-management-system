import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // In production, this would be a lookup against a fast KV store (like Vercel KV or Upstash)
  // or a cached fetch to our backend to map `host` -> `siteId`.
  // For local development, we default to site ID 1 (the first seeded site).
  let siteId = '1'; 

  // Example mappings:
  // if (host.includes('bus-brand-a.com')) siteId = '1';
  // if (host.includes('bus-brand-b.com')) siteId = '2';

  // Clone headers and inject the resolved tenant ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-id', siteId);

  // Return the response with the modified headers so Server Components can read it
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Apply to all routes except static assets and API routes
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
