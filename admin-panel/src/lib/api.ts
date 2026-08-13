const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function api<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    // Auto-inject token from localStorage if in browser
    let finalToken = token;
    let siteId = null;
    if (typeof window !== 'undefined') {
        if (!finalToken) finalToken = localStorage.getItem('cms_token') || undefined;
        siteId = localStorage.getItem('cms_site_id');
    }

    if (finalToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${finalToken}`;
    }
    
    if (siteId) {
        (headers as Record<string, string>)['x-site-id'] = siteId;
    }

    const res = await fetch(`${API_URL}${path}`, { headers, ...rest });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
}

// Convenience methods
// Convenience methods
export const apiGet = <T = any>(path: string, token?: string) => api<T>(path, { token });

export const apiPost = <T = any>(path: string, body: any, token?: string) =>
    api<T>(path, { method: 'POST', body: JSON.stringify(body), token });

export const apiPut = <T = any>(path: string, body: any, token?: string) =>
    api<T>(path, { method: 'PUT', body: JSON.stringify(body), token });

export const apiPatch = <T = any>(path: string, body: any, token?: string) =>
    api<T>(path, { method: 'PATCH', body: JSON.stringify(body), token });

export const apiDelete = <T = any>(path: string, token?: string) =>
    api<T>(path, { method: 'DELETE', token });
