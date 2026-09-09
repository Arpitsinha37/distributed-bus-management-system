'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { Plug, Search, Power, PowerOff, Trash2, Download, Box, ExternalLink } from 'lucide-react';

interface PluginItem {
    id: string;
    name: string;
    displayName: string;
    description: string;
    version: string;
    author: string;
    enabled: boolean;
    config?: Record<string, any>;
    installedAt?: string;
}

const samplePlugins = [
    { name: 'seo-optimizer', displayName: 'SEO Optimizer', description: 'Automatic meta tags, sitemap generation, and structured data', version: '1.2.0', author: 'CMS Core' },
    { name: 'analytics-dashboard', displayName: 'Analytics Dashboard', description: 'Google Analytics integration with real-time visitor stats', version: '2.0.1', author: 'CMS Core' },
    { name: 'form-builder', displayName: 'Form Builder', description: 'Drag-and-drop form builder with email notifications', version: '1.0.0', author: 'Community' },
    { name: 'image-optimizer', displayName: 'Image Optimizer', description: 'Automatic WebP conversion and lazy loading', version: '1.1.0', author: 'CMS Core' },
    { name: 'social-sharing', displayName: 'Social Sharing', description: 'Add social share buttons to pages and blog posts', version: '1.0.3', author: 'Community' },
];

export default function PluginsPage() {
    const { accessToken } = useStore();
    const [plugins, setPlugins] = useState<PluginItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'installed' | 'marketplace'>('installed');

    const fetchPlugins = async () => {
        try {
            const res = await apiGet<PluginItem[]>('/plugins', accessToken!);
            setPlugins(Array.isArray(res) ? res : []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchPlugins(); }, [accessToken]);

    const togglePlugin = async (plugin: PluginItem) => {
        try {
            if (plugin.enabled) {
                await apiPost(`/plugins/${plugin.id}/disable`, {}, accessToken!);
            } else {
                await apiPost(`/plugins/${plugin.id}/enable`, {}, accessToken!);
            }
            fetchPlugins();
        } catch (err: any) { alert(err.message); }
    };

    const installPlugin = async (name: string) => {
        try {
            await apiPost('/plugins/install', { name }, accessToken!);
            fetchPlugins();
            setTab('installed');
        } catch (err: any) { alert(err.message); }
    };

    const uninstallPlugin = async (id: string) => {
        if (!confirm('Uninstall this plugin?')) return;
        try {
            await apiPost(`/plugins/${id}/uninstall`, {}, accessToken!);
            fetchPlugins();
        } catch (err: any) { alert(err.message); }
    };

    const filtered = plugins.filter(p =>
        p.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Plug className="w-6 h-6 text-green-500" /> Plugins
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Extend your CMS with plugins</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                <button onClick={() => setTab('installed')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'installed' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    Installed ({plugins.length})
                </button>
                <button onClick={() => setTab('marketplace')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'marketplace' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    Marketplace
                </button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search plugins..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none" />
            </div>

            {tab === 'installed' ? (
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-gray-400 text-center py-12">Loading...</p>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Box className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">No plugins installed</p>
                            <p className="text-sm mt-1">Browse the marketplace to install plugins</p>
                        </div>
                    ) : filtered.map(p => (
                        <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Plug className={`w-6 h-6 ${p.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.displayName || p.name}</h3>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">v{p.version}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5 truncate">{p.description}</p>
                                <p className="text-xs text-gray-400 mt-1">by {p.author}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => togglePlugin(p)}
                                    className={`p-2 rounded-lg transition-colors ${p.enabled ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800'}`}
                                    title={p.enabled ? 'Disable' : 'Enable'}>
                                    {p.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                </button>
                                <button onClick={() => uninstallPlugin(p.id)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {samplePlugins.filter(p => p.name.includes(search.toLowerCase()) || p.displayName.toLowerCase().includes(search.toLowerCase())).map(p => {
                        const installed = plugins.some(ip => ip.name === p.name);
                        return (
                            <div key={p.name} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Plug className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-400">{p.version}</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{p.displayName}</h3>
                                <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                                <p className="text-xs text-gray-400 mt-2">by {p.author}</p>
                                <button onClick={() => !installed && installPlugin(p.name)} disabled={installed}
                                    className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-colors ${installed ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}>
                                    {installed ? '✓ Installed' : 'Install Plugin'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
