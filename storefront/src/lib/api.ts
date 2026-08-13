import axios from 'axios';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

// We don't attach the site ID here globally because Next.js App Router 
// renders on the server and shares this instance across multiple requests.
// Instead, we will pass the site ID explicitly to the API calls in Server Components.
