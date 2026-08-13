'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let t = localStorage.getItem('cms_token');
        if (!t) {
            const storeState = localStorage.getItem('cms-admin-store');
            if (storeState) {
                try {
                    t = JSON.parse(storeState).state.accessToken;
                } catch (e) {}
            }
        }
        setToken(t);
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();
        const t = data.accessToken || data.access_token || data.token;
        localStorage.setItem('cms_token', t);
        setToken(t);
        return t;
    };

    const logout = () => {
        localStorage.removeItem('cms_token');
        setToken(null);
        router.push('/');
    };

    const authFetch = async (url: string, options: RequestInit = {}) => {
        let t = localStorage.getItem('cms_token');
        if (!t) {
            const storeState = localStorage.getItem('cms-admin-store');
            if (storeState) {
                try {
                    t = JSON.parse(storeState).state.accessToken;
                } catch (e) {}
            }
        }
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
                ...options.headers,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Session expired or invalid token. Please log in again.");
                logout();
            } else {
                let errorMsg = `Server Error (${res.status})`;
                try {
                    const data = await res.clone().json();
                    if (data && data.message) {
                        errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
                    }
                } catch (e) {
                    // Ignore JSON parsing errors
                }
                alert(`Error: ${errorMsg}`);
            }
            throw new Error(`HTTP Error Status: ${res.status}`);
        }

        return res;
    };

    return { token, loading, login, logout, authFetch, API_URL };
}
