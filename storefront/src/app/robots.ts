import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/account/',
          '/search',
          '/search?*',
          '/passenger-details',
          '/payment/',
          '/payment-success',
          '/payment-fail',
          '/booking/',
          '/booking/*',
          '/ticket',
          '/track',
          '/cancel',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/search',
          '/passenger-details',
          '/payment/',
          '/payment-success',
          '/payment-fail',
          '/booking/',
          '/ticket',
          '/track',
          '/cancel',
          '/account/',
        ],
      },
    ],
    sitemap: 'https://pokharatokathmandutouristbusbooking.com/sitemap.xml',
    host: 'https://pokharatokathmandutouristbusbooking.com',
  }
}
