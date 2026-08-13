'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, SlidersHorizontal, X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Slider {
    id: string; title: string; subtitle: string; imageUrl: string; linkUrl: string; isActive: boolean; order: number;
}

export default function SlidersPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<Slider[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Slider | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true, order: 0 });

    const fetchAll = async () => {
        try { const res = await apiGet<Slider[]>('/cms/sliders', accessToken!); setData(res || []); } catch {} setLoading(false);
    };
    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPatch(`/cms/sliders/${editing.id}`, form, accessToken!);
            else await apiPost('/cms/sliders', form, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this slider?')) return;
        await apiDelete(`/cms/sliders/${id}`, accessToken!); fetchAll();
    };

    const filtered = data.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <SlidersHorizontal className="w-6 h-6 text-purple-500" /> Hero Sliders
                    </h1>
                </div>
                <button onClick={() => { setEditing(null); setForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true, order: 0 }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add Slider
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 relative">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-gray-400"><ImageIcon className="w-8 h-8"/></div>}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button onClick={() => { setEditing(item); setForm({ ...item, subtitle: item.subtitle||'', linkUrl: item.linkUrl||'' }); setShowModal(true); }} className="p-1.5 bg-white/90 text-gray-700 rounded hover:text-blue-600"><Pencil className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white/90 text-gray-700 rounded hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.subtitle}</p>
                            <div className="flex items-center gap-3 mt-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                <span className="text-[10px] text-gray-400">Order: {item.order}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold">{editing ? 'Edit Slider' : 'Add Slider'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm mb-1">Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            <div><label className="block text-sm mb-1">Subtitle</label><input type="text" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                                <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
                            </div>

                            <div><label className="block text-sm mb-1">Link URL</label><input type="text" value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                <div><label className="block text-sm mb-1">Status</label><select value={form.isActive ? '1':'0'} onChange={e => setForm({...form, isActive: e.target.value === '1'})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none"><option value="1">Active</option><option value="0">Inactive</option></select></div>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg">{editing ? 'Update' : 'Create'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
