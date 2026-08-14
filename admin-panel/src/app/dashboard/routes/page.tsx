'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Route as RouteIcon, X } from 'lucide-react';

interface RouteItem { id: string; source: string; destination: string; slug: string; distance?: number; duration?: number; status: string; }

export default function RoutesPage() {
    const { accessToken } = useStore();
    const [routes, setRoutes] = useState<RouteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<RouteItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ originCity: '', destinationCity: '', distanceKm: 0, durationMinutes: 0, boardingPoints: [] as string[], droppingPoints: [] as string[] });

    const fetchRoutes = async () => { try { const r = await apiGet<{ data: RouteItem[] }>('/routes', accessToken!); setRoutes(r.data || []); } catch { } setLoading(false); };
    useEffect(() => { fetchRoutes(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) { await apiPatch(`/routes/${editing.id}`, form, accessToken!); }
            else { await apiPost('/routes', form, accessToken!); }
            setShowModal(false); setEditing(null); fetchRoutes();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => { if (!confirm('Delete this route?')) return; await apiDelete(`/routes/${id}`, accessToken!); fetchRoutes(); };

    const filtered = routes.filter(r => (r.originCity||'').toLowerCase().includes(search.toLowerCase()) || (r.destinationCity||'').toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><RouteIcon className="w-6 h-6 text-orange-500" /> Route Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage bus routes across Nepal</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ originCity: '', destinationCity: '', distanceKm: 0, durationMinutes: 0, boardingPoints: [], droppingPoints: [] }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"><Plus className="w-4 h-4" /> Add Route</button>
            </div>
            <div className="relative mb-5"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search routes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none" /></div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500"><tr><th className="text-left px-5 py-3 font-medium">Origin</th><th className="text-left px-5 py-3 font-medium">Destination</th><th className="text-left px-5 py-3 font-medium">Distance</th><th className="text-left px-5 py-3 font-medium">Boarding / Dropping</th><th className="text-right px-5 py-3 font-medium">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No routes found</td></tr> : filtered.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{r.originCity}</td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{r.destinationCity}</td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{r.distanceKm ? `${r.distanceKm} km` : '—'}</td>
                                <td className="px-5 py-3.5">
                                    <div className="text-xs text-gray-500">
                                        <div><span className="font-semibold">Boarding:</span> {r.boardingPoints?.length || 0} pts</div>
                                        <div><span className="font-semibold">Dropping:</span> {r.droppingPoints?.length || 0} pts</div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => { setEditing(r); setForm({ originCity: r.originCity, destinationCity: r.destinationCity, distanceKm: r.distanceKm || 0, durationMinutes: r.durationMinutes || 0, boardingPoints: r.boardingPoints || [], droppingPoints: r.droppingPoints || [] }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Route' : 'Add Route'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin City</label><input type="text" value={form.originCity} onChange={e => setForm({ ...form, originCity: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Kathmandu" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination City</label><input type="text" value={form.destinationCity} onChange={e => setForm({ ...form, destinationCity: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Pokhara" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance (km)</label><input type="number" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins)</label><input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="390" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Boarding Points (Comma separated)</label>
                                <textarea value={form.boardingPoints.join(', ')} onChange={e => setForm({ ...form, boardingPoints: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} rows={2} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Kalanki, Gongabu..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dropping Points (Comma separated)</label>
                                <textarea value={form.droppingPoints.join(', ')} onChange={e => setForm({ ...form, droppingPoints: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} rows={2} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Prithvi Chowk..." />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm">{editing ? 'Update Route' : 'Create Route'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
