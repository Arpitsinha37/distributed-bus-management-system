'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { branchName: '', address: '', phone: '', email: '', googleMapEmbedUrl: '', workingHours: '' };

export default function LocationsPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);

    const load = async () => { setLoading(true); const r = await authFetch(`${API_URL}/locations`); const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false); };
    useEffect(() => { load(); }, []);
    const save = async () => {
        if (editing) { await authFetch(`${API_URL}/locations/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) }); }
        else { await authFetch(`${API_URL}/locations`, { method: 'POST', body: JSON.stringify(form) }); }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };
    const del = async (id: string) => { if (!confirm('Delete?')) return; try {
            const res = await authFetch(`${API_URL}/locations/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); } load(); };
    const edit = (item: any) => { setEditing(item); setForm({ ...item }); setShowForm(true); };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Locations</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Manage office and branch locations</p></div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Add Location</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <p className="text-slate-400 col-span-3 py-12 text-center">Loading...</p>
                    : items.length === 0 ? <p className="text-slate-400 col-span-3 py-12 text-center">No locations found</p>
                        : items.map(item => (
                            <div key={item.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-gray-900 dark:text-white font-semibold">{item.branchName}</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400"><Pencil className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-slate-300 text-sm mb-1">{item.address}</p>
                                {item.phone && <p className="text-slate-400 text-xs">📞 {item.phone}</p>}
                                {item.email && <p className="text-slate-400 text-xs">✉️ {item.email}</p>}
                                {item.workingHours && <p className="text-slate-400 text-xs mt-1">⏰ {item.workingHours}</p>}
                            </div>
                        ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">{editing ? 'Edit' : 'Add'} Location</h2>
                        <div className="space-y-4">
                            {[['branchName', 'Branch Name'], ['address', 'Address'], ['phone', 'Phone'], ['email', 'Email'], ['workingHours', 'Working Hours (e.g. Mon-Sat 9am-6pm)'], ['googleMapEmbedUrl', 'Google Maps Embed URL']].map(([k, l]) => (
                                <div key={k}><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{l}</label><input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                            ))}
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
