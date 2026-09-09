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
