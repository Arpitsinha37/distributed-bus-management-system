import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Resolve an image path to a display URL.
 * - Cloudinary URLs (res.cloudinary.com) → passed through as-is (already CDN-optimized)
 * - Absolute HTTP URLs → passed through
 * - data: URIs (legacy base64) → passed through (will be migrated away)
 * - Relative paths → prepended with API base URL
 */
export function getImageUrl(imagePath: string) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) {
        return imagePath;
    }
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const cleanURL = apiURL.endsWith('/api') ? apiURL.slice(0, -4) : apiURL;
    return `${cleanURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

/**
 * Build a Cloudinary-optimized image URL with automatic format and quality.
 * Use this when you know the Cloudinary public_id and want custom transforms.
 *
 * @example cloudinaryUrl('newroadtravels/photos/bus', { w: 800, h: 600 })
 *          → 'https://res.cloudinary.com/dealfp76k/image/upload/f_auto,q_auto,w_800,h_600/newroadtravels/photos/bus'
 */
export function cloudinaryUrl(
    publicId: string,
    options: { w?: number; h?: number; crop?: string } = {},
): string {
    const CLOUD_NAME = 'dealfp76k';
    const transforms = ['f_auto', 'q_auto'];
    if (options.w) transforms.push(`w_${options.w}`);
    if (options.h) transforms.push(`h_${options.h}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}
