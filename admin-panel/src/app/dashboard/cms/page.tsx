'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/useDebounce';
import { useAuth } from '@/lib/useAuth';
import {
    Plus, Pencil, Trash2, Search, ChevronLeft, Globe, FileText
} from 'lucide-react';
import RichEditor from '@/components/RichEditor';

const EMPTY = {
    title: '', slug: '', content: '', status: 'published',
    seoTitle: '', seoDesc: '', seoKeywords: ''
};

type TabKey = 'content' | 'seo';

export default function ContentPages() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [activeTab, setActiveTab] = useState<TabKey>('content');
    const [saving, setSaving] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const load = async () => {
        setLoading(true);
        try {
            const r = await authFetch(`${API_URL}/cms/pages`);
            const d = await r.json(); 
            setItems(Array.isArray(d) ? d : []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };
    useEffect(() => { load(); }, [debouncedSearch]);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const save = async () => {
        setSaving(true);
        try {
            const payload = { ...form, slug: form.slug || generateSlug(form.title) };
            delete payload.id; delete payload.createdAt; delete payload.updatedAt;

            if (editing) { 
                await authFetch(`${API_URL}/cms/pages/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); 
            } else { 
                await authFetch(`${API_URL}/cms/pages`, { method: 'POST', body: JSON.stringify(payload) }); 
            }
            setEditMode(false); setEditing(null); setForm(EMPTY); load();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const del = async (id: string) => {
        if (!confirm('Delete this page?')) return; 
        try {
            const res = await authFetch(`${API_URL}/cms/pages/${id}`, { method: 'DELETE' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch (e) { console.error('Delete error', e); alert('Failed to delete.'); } 
        load();
    };

    const edit = (item: any) => {
        setEditing(item);
        setForm({ ...item });
        setActiveTab('content');
        setEditMode(true);
    };

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'content', label: 'Content', icon: FileText },
        { key: 'seo', label: 'SEO', icon: Globe },
    ];

    if (editMode) {
        return (
            <div className="min-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setEditMode(false); setEditing(null); setForm(EMPTY); }}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Pages
                        </button>
                        <span className="text-gray-300">/</span>
                        <h1 className="text-lg font-bold text-gray-900">{editing ? 'Edit Page' : 'New Page'}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={save} disabled={saving}
                            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {saving ? 'Saving...' : 'Update'}
                        </button>
                    </div>
                </div>

                <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'}`}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">TITLE *</label>
                                    <input value={form.title || ''} onChange={e => {
                                        const title = e.target.value;
                                        setForm((p: any) => ({ ...p, title, slug: editing ? p.slug : generateSlug(title) }));
                                    }} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">SLUG *</label>
                                    <input value={form.slug || ''} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 text-sm focus:outline-none focus:border-red-500 font-mono" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">PAGE CONTENT (Rich Text)</label>
                                <div className="border border-gray-300 rounded-xl overflow-hidden min-h-[400px]">
                                    <RichEditor value={form.content || ''} onChange={(val: string) => setForm((p: any) => ({ ...p, content: val }))} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'seo' && (
                        <div className="space-y-6 max-w-3xl">
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
                                <h3 className="text-orange-700 text-sm font-bold mb-1">Search Engine Optimization</h3>
                                <p className="text-orange-600/70 text-xs">These fields dictate how this page appears on Google and social media.</p>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">SEO META TITLE</label>
                                <input value={form.seoTitle || ''} onChange={e => setForm((p: any) => ({ ...p, seoTitle: e.target.value }))}
                                    placeholder={form.title || 'Optimal length: 50-60 characters'}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500" />
                                <div className="mt-1 text-xs text-gray-400">{(form.seoTitle || '').length} / 60 chars</div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">META DESCRIPTION</label>
                                <textarea value={form.seoDesc || ''} onChange={e => setForm((p: any) => ({ ...p, seoDesc: e.target.value }))}
                                    placeholder="Optimal length: 150-160 characters" rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500" />
                                <div className="mt-1 text-xs text-gray-400">{(form.seoDesc || '').length} / 160 chars</div>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">META KEYWORDS</label>
                                <input value={form.seoKeywords || ''} onChange={e => setForm((p: any) => ({ ...p, seoKeywords: e.target.value }))}
                                    placeholder="e.g. tour, trekking, nepal, holiday (comma separated)"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-red-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --------------- LIST MODE ---------------
    return (
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage content pages and SEO across storefronts.</p>
                </div>
                <button onClick={() => { setForm(EMPTY); setEditing(null); setActiveTab('content'); setEditMode(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-500/20 active:scale-95">
                    <Plus className="w-5 h-5" /> New Page
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="p-4">Title / Slug</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading pages...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-gray-500">No pages found.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900">{item.title}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">/{item.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => edit(item)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => del(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
