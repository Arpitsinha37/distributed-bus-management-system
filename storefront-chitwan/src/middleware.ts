import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  
  // Use the environment variable to determine which site this storefront represents.
  // Defaults to 'chitwan-travels' for local dev backward compatibility.
  let siteId = process.env.NEXT_PUBLIC_SITE_ID || 'chitwan-travels';

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
