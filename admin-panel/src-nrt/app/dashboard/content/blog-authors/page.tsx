'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import RichEditor from '@/components/RichEditor';

const EMPTY = { name: '', slug: '', image: '', bio: '' };
export default function BlogAuthorsPage() {
    const { authFetch, API_URL, token } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const load = async () => { setLoading(true); const r = await authFetch(`${API_URL}/blog-authors?search=${search}`); const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false); };
    useEffect(() => { load(); }, [search]);
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const save = async () => {
        const payload = { ...form }; if (!payload.slug) payload.slug = slugify(payload.name);
        delete payload.id; delete payload.createdAt; delete payload.updatedAt;
        if (editing) { await authFetch(`${API_URL}/blog-authors/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
        else { await authFetch(`${API_URL}/blog-authors`, { method: 'POST', body: JSON.stringify(payload) }); }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };
    const del = async (id: string) => { if (!confirm('Delete?')) return; try {
            const res = await authFetch(`${API_URL}/blog-authors/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); } load(); };
    const edit = (item: any) => { setEditing(item); setForm({ ...EMPTY, ...item }); setShowForm(true); };
    return (
        <div>
            <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Authors</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Manage blog authors</p></div><button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Create</button></div>
            <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500" /></div>
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-gray-200 dark:border-white/10"><tr className="text-slate-600 dark:text-slate-400"><th className="px-4 py-3 text-left">Image</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Slug</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-200 dark:divide-white/5">{loading ? <tr><td colSpan={4} className="text-center py-12 text-slate-400">Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={4} className="text-center py-12 text-slate-400">No authors found</td></tr> : items.map(item => (<tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5"><td className="px-4 py-3">{item.image ? <img src={item.image} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 bg-slate-700 rounded-full" />}</td><td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.name}</td><td className="px-4 py-3 text-gray-700 dark:text-slate-300">{item.slug}</td><td className="px-4 py-3"><div className="flex gap-2 justify-end"><button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400"><Pencil className="w-4 h-4" /></button><button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div></td></tr>))}</tbody></table></div>
            {showForm && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"><h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit' : 'Create'} Author</h2><div className="space-y-4"><div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Name *</label><input value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div><div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Slug *</label><input value={form.slug} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div><ImageUpload value={form.image || ''} onChange={(url) => setForm((p: any) => ({ ...p, image: url }))} label="Author Image" apiUrl={API_URL} token={token} previewClass="h-24 w-24 rounded-full" /><RichEditor value={form.bio || ''} onChange={(val) => setForm((p: any) => ({ ...p, bio: val }))} label="Bio" placeholder="Author bio..." /></div><div className="flex gap-3 mt-6"><button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 px-4 py-2 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-900/10">Cancel</button><button onClick={save} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white dark:text-white rounded-lg text-sm font-medium">Save</button></div></div></div>)}
        </div>
    );
}
