'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface GalleryImage { id: string; title: string; imageUrl: string; category: string; order: number; }

export default function GalleryPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<GalleryImage | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ title: '', imageUrl: '', category: '', order: 0 });

    const fetchAll = async () => {
        try { const res = await apiGet<GalleryImage[]>('/cms/gallery', accessToken!); setData(res || []); } catch {} setLoading(false);
    };
    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPatch(`/cms/gallery/${editing.id}`, form, accessToken!);
            else await apiPost('/cms/gallery', form, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this image?')) return;
        await apiDelete(`/cms/gallery/${id}`, accessToken!); fetchAll();
    };

    const filtered = data.filter(i => (i.title||'').toLowerCase().includes(search.toLowerCase()) || (i.category||'').toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-pink-500" /> Photo Gallery
                    </h1>
                </div>
                <button onClick={() => { setEditing(null); setForm({ title: '', imageUrl: '', category: '', order: 0 }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add Image
                </button>
            </div>
            
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by title or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm group">
                        <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 relative">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-400"><ImageIcon className="w-8 h-8"/></div>}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => { setEditing(item); setForm({ title: item.title||'', imageUrl: item.imageUrl, category: item.category||'', order: item.order }); setShowModal(true); }} className="p-2 bg-white text-gray-900 rounded-full hover:text-blue-600"><Pencil className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white text-gray-900 rounded-full hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                        {(item.title || item.category) && (
                            <div className="p-3">
                                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.title || 'Untitled'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold">{editing ? 'Edit Image' : 'Add Image'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                                <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
                            </div>
                            <div><label className="block text-sm mb-1">Title (Optional)</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Category</label><input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                <div><label className="block text-sm mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg">{editing ? 'Update' : 'Create'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
