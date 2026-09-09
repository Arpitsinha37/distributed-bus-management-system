'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

const EMPTY = { customerName: '', reviewText: '', rating: 5, location: '', approved: false };

export default function TestimonialsPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [filter, setFilter] = useState<string>('all');

    const load = async () => {
        setLoading(true);
        const q = filter === 'all' ? '' : `approved=${filter === 'approved'}`;
        const r = await authFetch(`${API_URL}/testimonials?${q}&limit=100`);
        const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false);
    };
    useEffect(() => { load(); }, [filter]);

    const save = async () => {
        const payload = { ...form, rating: parseInt(String(form.rating)) };
        delete payload.id; delete payload.createdAt; delete payload.updatedAt;
        if (editing) { await authFetch(`${API_URL}/testimonials/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
        else { await authFetch(`${API_URL}/testimonials`, { method: 'POST', body: JSON.stringify(payload) }); }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };
    const del = async (id: string) => { if (!confirm('Delete?')) return; try {
            const res = await authFetch(`${API_URL}/testimonials/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); } load(); };
    const toggle = async (item: any) => { await authFetch(`${API_URL}/testimonials/${item.id}/approve`, { method: 'PATCH', body: JSON.stringify({ approved: !item.approved }) }); load(); };
    const edit = (item: any) => { setEditing(item); setForm({ ...item, rating: String(item.rating) }); setShowForm(true); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage customer reviews and approvals</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Review
                </button>
            </div>

            <div className="flex gap-2 mb-4">
                {[['all', 'All'], ['approved', 'Approved'], ['pending', 'Pending']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${filter === v ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-white/5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}>{l}</button>
                ))}
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-white/10">
                        <tr className="text-slate-600 dark:text-slate-400">
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Review</th>
                            <th className="px-4 py-3 text-left">Rating</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {loading ? (<tr><td colSpan={5} className="text-center py-12 text-slate-400">Loading...</td></tr>)
                            : items.length === 0 ? (<tr><td colSpan={5} className="text-center py-12 text-slate-400">No testimonials found</td></tr>)
                                : items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.customerName}<br /><span className="text-slate-400 text-xs">{item.location}</span></td>
                                        <td className="px-4 py-3 text-gray-700 dark:text-slate-300 max-w-xs truncate">{item.reviewText}</td>
                                        <td className="px-4 py-3 text-yellow-400">{'★'.repeat(item.rating)}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => toggle(item)} className="flex items-center gap-1.5 text-xs">
                                                {item.approved ? <><CheckCircle className="w-4 h-4 text-green-400" /><span className="text-green-400">Approved</span></> : <><XCircle className="w-4 h-4 text-orange-400" /><span className="text-orange-400">Pending</span></>}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{editing ? 'Edit' : 'Add'} Testimonial</h2>
                        <div className="space-y-4">
                            {[['customerName', 'Customer Name'], ['location', 'Location'], ['rating', 'Rating (1-5)']].map(([k, l]) => (
                                <div key={k}><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{l}</label><input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                            ))}
                            <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Review</label><textarea rows={4} value={form.reviewText || ''} onChange={e => setForm((p: any) => ({ ...p, reviewText: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 resize-none" /></div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="approved" checked={form.approved || false} onChange={e => setForm((p: any) => ({ ...p, approved: e.target.checked }))} className="w-4 h-4 accent-red-500" />
                                <label htmlFor="approved" className="text-gray-700 dark:text-slate-300 text-sm">Approve this review</label>
                            </div>
                        </div>
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
