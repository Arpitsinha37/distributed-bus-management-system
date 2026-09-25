import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            // Fix inconsistent /content/ URLs → canonical paths
            {
                source: '/content/about',
                destination: '/about',
                permanent: true, // 301
            },
            {
                source: '/content/contact',
                destination: '/contact',
                permanent: true, // 301
            },
            // Catch any other /content/ pages and redirect
            {
                source: '/content/:slug',
                destination: '/:slug',
                permanent: true,
            },
        ];
    },
    webpack: (config) => {
        // Alias react-router-dom to our Next.js compatibility shim
        // so NRT pages work without rewriting their imports
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-router-dom': path.resolve(__dirname, 'src/lib/react-router-shim.tsx'),
            // Alias NRT's lib/api import to our api.ts
            '../lib/api': path.resolve(__dirname, 'src/lib/api.ts'),
            '../../lib/api': path.resolve(__dirname, 'src/lib/api.ts'),
            // Alias helmet (not needed in Next.js, use Head component instead)
            'react-helmet-async': path.resolve(__dirname, 'src/lib/helmet-shim.tsx'),
        };
        // Allow .jsx files
        config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', ...config.resolve.extensions];
        return config;
    },
};
export default nextConfig;
