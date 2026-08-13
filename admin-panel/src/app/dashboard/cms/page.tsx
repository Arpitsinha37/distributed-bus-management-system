'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, FileText, X, Eye, Globe, FileLock } from 'lucide-react';

interface PageItem {
    id: string;
    title: string;
    slug: string;
    status: string;
    template?: string;
    seoTitle?: string;
    seoDescription?: string;
    blocks?: any[];
    createdAt: string;
    publishedAt?: string;
}

export default function CMSPagesPage() {
    const { accessToken } = useStore();
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<PageItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        title: '', slug: '', status: 'draft', template: 'default',
        seoTitle: '', seoDescription: '', blocks: [] as any[],
    });

    const fetchPages = async () => {
        try {
            const res = await apiGet<PageItem[]>('/pages', accessToken!);
            setPages(Array.isArray(res) ? res : []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchPages(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPut(`/pages/${editing.id}`, form, accessToken!);
            else await apiPost('/pages', form, accessToken!);
            setShowModal(false); setEditing(null); fetchPages();
        } catch (err: any) { alert(err.message); }
    };

    const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this page?')) return;
        await apiDelete(`/pages/${id}`, accessToken!);
        fetchPages();
    };

    const openEdit = (p: PageItem) => {
        setEditing(p);
        setForm({ title: p.title, slug: p.slug, status: p.status, template: p.template || 'default', seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', blocks: p.blocks || [] });
        setShowModal(true);
    };

    const togglePublish = async (p: PageItem) => {
        try {
            const newStatus = p.status === 'published' ? 'draft' : 'published';
            await apiPut(`/pages/${p.id}`, { status: newStatus }, accessToken!);
            fetchPages();
        } catch (err: any) { alert(err.message); }
    };

    const filtered = pages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-500" /> CMS Pages
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Build and manage pages with the block-based editor</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ title: '', slug: '', status: 'draft', template: 'default', seoTitle: '', seoDescription: '', blocks: [] }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"><Plus className="w-4 h-4" /> New Page</button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search pages..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <p className="text-gray-400 col-span-full text-center py-12">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-gray-400 col-span-full text-center py-12">No pages found. Create your first page!</p>
                ) : filtered.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg transition-shadow group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.title}</h3>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">/{p.slug}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${p.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>{p.status}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            {p.blocks?.length || 0} blocks · {p.template || 'default'} template
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => togglePublish(p)} className="p-1.5 text-gray-400 hover:text-green-500 transition-colors" title={p.status === 'published' ? 'Unpublish' : 'Publish'}>
                                {p.status === 'published' ? <FileLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-auto" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Page' : 'Create Page'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input type="text" value={form.title} onChange={e => { setForm({ ...form, title: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) }); }} required
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="About Us" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template</label>
                                    <select value={form.template} onChange={e => setForm({ ...form, template: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="default">Default</option>
                                        <option value="landing">Landing</option>
                                        <option value="blog">Blog</option>
                                        <option value="full-width">Full Width</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
                                <input type="text" value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Page title for search engines" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Description</label>
                                <textarea value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} rows={2}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none resize-none" placeholder="Meta description for search engines..." />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                                {editing ? 'Update Page' : 'Create Page'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
