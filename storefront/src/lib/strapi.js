import axios from 'axios';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

const strapi = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Fetch data from a Strapi collection
 * @param {string} endpoint - The API endpoint (e.g., 'buses', 'routes')
 * @param {object} params - Query parameters (filters, populate, sort, etc.)
 * @returns {Promise<object>} - The response data
 */
export async function fetchCollection(endpoint, params = {}) {
    try {
        const response = await strapi.get(`/${endpoint}`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Fetch a single entry from Strapi
 * @param {string} endpoint - The API endpoint (e.g., 'buses')
 * @param {string|number} id - The entry ID
 * @param {object} params - Query parameters (populate, etc.)
 * @returns {Promise<object>} - The response data
 */
export async function fetchEntry(endpoint, id, params = {}) {
    try {
        const response = await strapi.get(`/${endpoint}/${id}`, { params });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}/${id}:`, error);
        throw error;
    }
}

/**
 * Create a new entry in Strapi
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The data to create
 * @returns {Promise<object>} - The created entry
 */
export async function createEntry(endpoint, data) {
    try {
        const response = await strapi.post(`/${endpoint}`, { data });
        return response.data;
    } catch (error) {
        console.error(`Error creating ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Get the full URL for a Strapi media file
 * @param {string} path - The media path from Strapi
 * @returns {string} - The full URL
 */
export function getStrapiMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${STRAPI_URL}${path}`;
}

export { strapi, STRAPI_URL };
export default strapi;
