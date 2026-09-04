import axios from 'axios';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

// Automatically attach the site identifier to every request
// so the backend can scope data (bookings, CMS content, etc.) per storefront.
api.interceptors.request.use((config) => {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || 'chitwan-travels';
  config.headers['X-Site-Id'] = siteId;
  return config;
});

