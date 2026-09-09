'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import RichEditor from '@/components/RichEditor';

const EMPTY = { title: '', slug: '', content: '', category: '', image: '', altText: '', authorId: '', displayOrder: 0, seoTitle: '', seoKeywords: '', seoDescription: '', status: 'active', isFeatured: false };

export default function BlogsPage() {
    const { authFetch, API_URL, token } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [tab, setTab] = useState<'blog' | 'seo'>('blog');

    const load = async () => { setLoading(true); const r = await authFetch(`${API_URL}/blogs?search=${search}&limit=100`); const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false); };
    const loadAuthors = async () => { const r = await authFetch(`${API_URL}/blog-authors`); const d = await r.json(); setAuthors(Array.isArray(d) ? d : []); };
    useEffect(() => { load(); loadAuthors(); }, [search]);

    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const save = async () => {
        const payload = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
        delete payload.id; delete payload.createdAt; delete payload.updatedAt; delete payload.author;
        if (!payload.authorId) payload.authorId = null;
        if (!payload.slug) payload.slug = slugify(payload.title);
        try {
            let res;
            if (editing) { res = await authFetch(`${API_URL}/blogs/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
            else { res = await authFetch(`${API_URL}/blogs`, { method: 'POST', body: JSON.stringify(payload) }); }
            if (!res.ok) { const err = await res.json().catch(() => ({})); alert(`Error: ${err.message || 'Internal server error'}`); return; }
        } catch (e) { alert('Network error'); return; }
        setShowForm(false); setEditing(null); setForm(EMPTY); setTab('blog'); load();
    };
    const del = async (id: string) => {
        if (!confirm('Delete?')) return;
        try {
            const res = await authFetch(`${API_URL}/blogs/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); }
        load();
    };
    const toggle = async (item: any) => { await authFetch(`${API_URL}/blogs/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'active' ? 'draft' : 'active' }) }); load(); };
    const edit = (item: any) => { setEditing(item); setForm({ ...EMPTY, ...item }); setShowForm(true); setTab('blog'); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blogs</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Manage blog posts</p></div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); setTab('blog'); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Create</button>
            </div>
            <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blogs..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500" /></div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm"><thead className="border-b border-gray-200 dark:border-white/10"><tr className="text-slate-600 dark:text-slate-400"><th className="px-4 py-3 text-left">Image</th><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Author</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Featured</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {loading ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">No blogs found</td></tr> : items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">{item.image ? <img src={item.image} alt="" className="w-12 h-8 object-cover rounded" /> : <div className="w-12 h-8 bg-slate-700 rounded" />}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.title}</td>
                                <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{item.author?.name || '—'}</td>
                                <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{item.category || '—'}</td>
                                <td className="px-4 py-3">{item.isFeatured ? <span className="text-xs bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-0.5 rounded-full">Featured</span> : <span className="text-xs text-slate-400">—</span>}</td>
                                <td className="px-4 py-3"><button onClick={() => toggle(item)} className="flex items-center gap-1 text-xs">{item.status === 'active' ? <><ToggleRight className="w-5 h-5 text-green-400" /><span className="text-green-400">Active</span></> : <><ToggleLeft className="w-5 h-5 text-slate-400" /><span className="text-slate-600 dark:text-slate-400">Draft</span></>}</button></td>
                                <td className="px-4 py-3"><div className="flex items-center gap-2 justify-end"><button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button><button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit' : 'Create'} Blog</h2>
                            <div className="flex gap-2">
                                <button onClick={() => setTab('blog')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tab === 'blog' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-700 dark:text-slate-300'}`}>Blog</button>
                                <button onClick={() => setTab('seo')} className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tab === 'seo' ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-700 dark:text-slate-300'}`}>SEO</button>
                            </div>
                        </div>
                        {tab === 'blog' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Title *</label><input value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Slug *</label><input value={form.slug} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Author</label><select value={form.authorId || ''} onChange={e => setForm((p: any) => ({ ...p, authorId: e.target.value || null }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-white/10 rounded-lg text-gray-900 dark:text-white text-sm"><option value="">No Author</option>{authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Category</label><input value={form.category || ''} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Display Order</label><input type="number" value={form.displayOrder} onChange={e => setForm((p: any) => ({ ...p, displayOrder: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Status</label><select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-white/10 rounded-lg text-gray-900 dark:text-white text-sm"><option value="active">Active</option><option value="draft">Draft</option></select></div>
                                    <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Feature on Homepage</label><button type="button" onClick={() => setForm((p: any) => ({ ...p, isFeatured: !p.isFeatured }))} className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors ${form.isFeatured ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : 'bg-white text-gray-700 border-gray-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10'}`}>{form.isFeatured ? '✓ Featured' : 'Not Featured'}</button></div>
                                </div>
                                <ImageUpload value={form.image || ''} onChange={(url) => setForm((p: any) => ({ ...p, image: url }))} label="Featured Image" apiUrl={API_URL} token={token} />
                                <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Alt Text</label><input value={form.altText || ''} onChange={e => setForm((p: any) => ({ ...p, altText: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                <RichEditor value={form.content || ''} onChange={(val) => setForm((p: any) => ({ ...p, content: val }))} label="Content *" />
                            </div>
                        )}
                        {tab === 'seo' && (
                            <div className="space-y-4">
                                <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Meta Title</label><input value={form.seoTitle || ''} onChange={e => setForm((p: any) => ({ ...p, seoTitle: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Meta Keywords</label><input value={form.seoKeywords || ''} onChange={e => setForm((p: any) => ({ ...p, seoKeywords: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                                <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Meta Description</label><textarea value={form.seoDescription || ''} onChange={e => setForm((p: any) => ({ ...p, seoDescription: e.target.value }))} rows={4} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                            </div>
                        )}
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }} className="flex-1 px-4 py-2 border border-white/10 text-gray-700 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={save} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white dark:text-white rounded-lg text-sm font-medium transition-colors">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
