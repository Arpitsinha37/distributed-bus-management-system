/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
    },
};

module.exports = nextConfig;
