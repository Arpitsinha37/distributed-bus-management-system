const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
    token?: string;
}

export async function api<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...rest } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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
