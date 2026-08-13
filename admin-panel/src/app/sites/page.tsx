'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Globe, Plus, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function SitesPage() {
    const [sites, setSites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const logout = useStore((s) => s.logout);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                // The API returns { data: [...], total: X }
                const response = await apiGet('/sites?limit=100');
                if (response && response.data) {
                    setSites(response.data);
                }
            } catch (err: any) {
                console.error('Failed to load sites:', err);
                if (err.message && err.message.includes('401')) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('cms_token');
        if (!token) {
            router.push('/');
        } else {
            fetchSites();
        }
    }, [router]);

    const handleSelectSite = (site: any) => {
        localStorage.setItem('cms_site_id', site.id);
        localStorage.setItem('cms_site_name', site.name);
        router.push('/dashboard');
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_site_id');
        localStorage.removeItem('cms_site_name');
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            N
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">New Road Travels</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Select a Workspace</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Choose a storefront to manage its bookings, schedules, and specific CRM settings.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin h-12 w-12 text-red-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Global / Central Management Card */}
                        <button
                            onClick={() => handleSelectSite({ id: 'global', name: 'Central HQ' })}
                            className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-800 p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                        >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 bg-white/10 text-white">
                                <Globe className="w-7 h-7" />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                Central Headquarters
                            </h3>
                            <p className="text-sm font-medium text-slate-300 mb-6 truncate">
                                Global Fleet, Staff & Master Settings
                            </p>

                            <div className="flex items-center justify-between text-sm font-semibold text-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                <span>Enter Global Dashboard</span>
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </button>

                        {/* Storefront Cards */}
                        {sites.map((site) => (
                            <button
                                key={site.id}
                                onClick={() => handleSelectSite(site)}
                                className="group relative bg-white rounded-2xl border border-slate-200 p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                                <div className="absolute top-5 right-5">
                                    <div
                                        className={`w-3 h-3 rounded-full shadow-sm ${site.isActive !== false ? 'bg-green-500' : 'bg-slate-400'}`}
                                        title={site.isActive !== false ? 'Active' : 'Inactive'}
                                    />
                                </div>

                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 bg-red-50 text-red-600">
                                    <Globe className="w-7 h-7" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                                    {site.name}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mb-6 truncate">
                                    {site.domain}
                                </p>

                                <div className="flex items-center justify-between text-sm font-semibold text-red-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <span>Enter Dashboard</span>
                                    <div className="bg-red-100 p-1.5 rounded-lg">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}

                        <button
                            onClick={() => alert('Global Create Site flow not implemented yet.')}
                            className="group bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-left transition-all duration-300 hover:border-red-400 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/50 flex flex-col items-center justify-center min-h-[220px]"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:bg-red-100 group-hover:border-red-200 transition-colors shadow-sm">
                                <Plus className="w-7 h-7 text-slate-400 group-hover:text-red-600 transition-colors" />
                            </div>
                            <span className="text-base font-bold text-slate-500 group-hover:text-red-600 transition-colors">
                                Add New Website
                            </span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
