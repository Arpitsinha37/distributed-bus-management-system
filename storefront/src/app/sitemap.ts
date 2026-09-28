import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pokharatokathmandutouristbusbooking.com';

  const routes = [
    '',
    '/search',
    '/track',
    '/about',
    '/contact',
    // Dynamic slugs for SEO
    '/route/pokhara-to-kathmandu',
    '/route/kathmandu-to-pokhara',
    '/route/chitwan-to-kathmandu',
    '/route/kathmandu-to-chitwan',
    '/route/pokhara-to-chitwan',
    '/route/chitwan-to-pokhara',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : (route.startsWith('/route/') ? 0.9 : 0.8),
  }));
}
