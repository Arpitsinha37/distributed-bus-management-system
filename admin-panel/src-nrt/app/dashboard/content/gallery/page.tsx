'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

const EMPTY = { title: '', image: '', altText: '', category: '', displayOrder: 0, status: 'active' };
export default function GalleryPage() {
    const { authFetch, API_URL, token } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const load = async () => { setLoading(true); const r = await authFetch(`${API_URL}/gallery`); const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false); };
    useEffect(() => { load(); }, []);
    const save = async () => {
        const payload = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
        delete payload.id; delete payload.createdAt; delete payload.updatedAt;
        if (editing) { await authFetch(`${API_URL}/gallery/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
        else { await authFetch(`${API_URL}/gallery`, { method: 'POST', body: JSON.stringify(payload) }); }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };
    const del = async (id: string) => { if (!confirm('Delete?')) return; try {
            const res = await authFetch(`${API_URL}/gallery/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); } load(); };
    const edit = (item: any) => { setEditing(item); setForm({ ...EMPTY, ...item }); setShowForm(true); };
    return (
        <div>
            <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Manage image gallery</p></div><button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Create</button></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{loading ? <p className="text-slate-400 col-span-full text-center py-12">Loading...</p> : items.length === 0 ? <p className="text-slate-400 col-span-full text-center py-12">No images</p> : items.map(item => (<div key={item.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden group"><div className="aspect-square relative">{item.image ? <img src={item.image} alt={item.altText || ''} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700" />}<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><button onClick={() => edit(item)} className="p-2 bg-white/20 rounded-lg text-gray-900 dark:text-white hover:bg-blue-500/50"><Pencil className="w-4 h-4" /></button><button onClick={() => del(item.id)} className="p-2 bg-white/20 rounded-lg text-gray-900 dark:text-white hover:bg-red-500/50"><Trash2 className="w-4 h-4" /></button></div></div><div className="p-2"><p className="text-gray-900 dark:text-white text-xs truncate">{item.title || 'Untitled'}</p><p className="text-slate-400 text-[10px]">{item.category || 'Uncategorized'}</p></div></div>))}</div>
            {showForm && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"><h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit' : 'Add'} Image</h2><div className="space-y-4"><ImageUpload value={form.image || ''} onChange={(url) => setForm((p: any) => ({ ...p, image: url }))} label="Image *" apiUrl={API_URL} token={token} previewClass="h-40 w-full" /><div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Title</label><input value={form.title || ''} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div><div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Alt Text</label><input value={form.altText || ''} onChange={e => setForm((p: any) => ({ ...p, altText: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div><div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Category</label><input value={form.category || ''} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div></div><div className="flex gap-3 mt-6"><button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 px-4 py-2 border border-white/10 text-gray-700 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button><button onClick={save} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white dark:text-white rounded-lg text-sm font-medium">Save</button></div></div></div>)}
        </div>
    );
}
