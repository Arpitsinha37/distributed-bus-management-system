'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, MessageSquareQuote, X } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Testimonial { id: string; name: string; role: string; content: string; rating: number; avatarUrl: string; isActive: boolean; }

export default function TestimonialsPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5, avatarUrl: '', isActive: true });

    const fetchAll = async () => {
        try { const res = await apiGet<Testimonial[]>('/cms/testimonials', accessToken!); setData(res || []); } catch {} setLoading(false);
    };
    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPatch(`/cms/testimonials/${editing.id}`, form, accessToken!);
            else await apiPost('/cms/testimonials', form, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;
        await apiDelete(`/cms/testimonials/${id}`, accessToken!); fetchAll();
    };

    const filtered = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MessageSquareQuote className="w-6 h-6 text-yellow-500" /> Testimonials
                    </h1>
                </div>
                <button onClick={() => { setEditing(null); setForm({ name: '', role: '', content: '', rating: 5, avatarUrl: '', isActive: true }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add Testimonial
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 relative">
                        <div className="absolute top-3 right-3 flex gap-1">
                            <button onClick={() => { setEditing(item); setForm({ name: item.name, role: item.role||'', content: item.content, rating: item.rating, avatarUrl: item.avatarUrl||'', isActive: item.isActive }); setShowModal(true); }} className="p-1.5 bg-gray-50 text-gray-600 rounded hover:text-blue-600"><Pencil className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-gray-50 text-gray-600 rounded hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                        <div className="flex gap-1 text-yellow-400 mb-3">
                            {Array.from({length: 5}).map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < item.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-4">"{item.content}"</p>
                        <div className="flex items-center gap-3">
                            {item.avatarUrl ? <img src={item.avatarUrl} alt={item.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500">{item.name[0]}</div>}
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.role}</p>
                            </div>
                        </div>
                        {!item.isActive && <div className="absolute bottom-4 right-4"><span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">INACTIVE</span></div>}
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800"><h2 className="text-lg font-bold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                <div><label className="block text-sm mb-1">Role / Subtitle</label><input type="text" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar Image URL</label>
                                <ImageUpload value={form.avatarUrl} onChange={(url) => setForm({ ...form, avatarUrl: url })} />
                            </div>
                            <div><label className="block text-sm mb-1">Review Content</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows={4} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Rating (1-5)</label><input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
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
