import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'New Road Travels';
const SITE_URL = 'https://www.newroadtravels.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;
const DEFAULT_DESCRIPTION = 'Book buses, tour packages & rental vehicles across Nepal. Trusted by 50,000+ travelers for safe and comfortable journeys from the Himalayas to the Terai.';

/**
 * SEOHead — drop-in per-page SEO component
 * @param {object} props
 * @param {string} props.title        – Page-specific title (appended with site name)
 * @param {string} props.description  – Meta description (max ~155 chars)
 * @param {string} [props.path]       – URL path, e.g. "/about". Auto-derived from router if not passed.
 * @param {string} [props.image]      – OG image URL
 * @param {string} [props.type]       – OG type (default: "website")
 * @param {object|object[]} [props.structuredData] – JSON-LD structured data (single object or array)
 * @param {boolean} [props.noIndex]   – Set true to noindex the page
 */
const SEOHead = ({
    title,
    description = DEFAULT_DESCRIPTION,
    path,
    image: rawImage = DEFAULT_IMAGE,
    descriptionHtml,
    type = 'website',
    structuredData,
    noIndex = false,
}) => {
    // Resolve image: Facebook/Twitter cannot use data: URIs or relative paths
    const image = (() => {
        // Use primary image if it's a valid URL
        if (rawImage && !rawImage.startsWith('data:')) {
            if (rawImage.startsWith('http')) return rawImage;
            return `${SITE_URL}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
        }
        // Fallback: extract first https image from description HTML
        if (descriptionHtml) {
            const match = descriptionHtml.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
            if (match) return match[1];
        }
        return DEFAULT_IMAGE;
    })();
    // Auto-derive path from React Router if not explicitly passed
    const location = useLocation();
    const effectivePath = path ?? location.pathname;

    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Bus Booking, Tours & Vehicle Rentals in Nepal`;
    const canonicalUrl = `${SITE_URL}${effectivePath}`;

    // Normalize structured data — support single object or array of objects
    const schemas = structuredData
        ? Array.isArray(structuredData) ? structuredData : [structuredData]
        : [];

    return (
        <Helmet>
            {/* Core */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_NP" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data — render each schema as a separate script tag */}
            {schemas.map((schema, idx) => (
                <script key={idx} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEOHead;

