'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, CalendarClock, X, Clock, DollarSign } from 'lucide-react';

interface ScheduleItem {
    id: string;
    departureTime: string;
    arrivalTime: string;
    basePrice: number;
    status: string;
    daysOfWeek: string[];
    bus?: { id: string; name: string; busNumber: string };
    route?: { id: string; source: string; destination: string };
}

interface BusOption { id: string; name: string; busNumber: string; }
interface RouteOption { id: string; source: string; destination: string; }

export default function SchedulesPage() {
    const { accessToken } = useStore();
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [buses, setBuses] = useState<BusOption[]>([]);
    const [routes, setRoutes] = useState<RouteOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ScheduleItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        busId: '', routeId: '', departureTime: '', arrivalTime: '',
        basePrice: 0, daysOfWeek: [] as string[], status: 'active',
    });

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const fetchAll = async () => {
        try {
            const [sRes, bRes, rRes] = await Promise.all([
                apiGet<{ data: ScheduleItem[] }>('/schedules', accessToken!),
                apiGet<{ data: BusOption[] }>('/buses', accessToken!),
                apiGet<{ data: RouteOption[] }>('/routes', accessToken!),
            ]);
            setSchedules(sRes.data || []);
            setBuses(bRes.data || []);
            setRoutes(rRes.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPut(`/schedules/${editing.id}`, form, accessToken!);
            else await apiPost('/schedules', form, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this schedule?')) return;
        await apiDelete(`/schedules/${id}`, accessToken!);
        fetchAll();
    };

    const openEdit = (s: ScheduleItem) => {
        setEditing(s);
        setForm({
            busId: s.bus?.id || '', routeId: s.route?.id || '',
            departureTime: s.departureTime, arrivalTime: s.arrivalTime,
            basePrice: s.basePrice, daysOfWeek: s.daysOfWeek || [], status: s.status,
        });
        setShowModal(true);
    };

    const toggleDay = (day: string) => {
        setForm(f => ({
            ...f,
            daysOfWeek: f.daysOfWeek.includes(day) ? f.daysOfWeek.filter(d => d !== day) : [...f.daysOfWeek, day],
        }));
    };

    const filtered = schedules.filter(s =>
        (s.route?.source || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.route?.destination || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.bus?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarClock className="w-6 h-6 text-teal-500" /> Schedule Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage departure times, pricing, and weekly patterns</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ busId: '', routeId: '', departureTime: '', arrivalTime: '', basePrice: 0, daysOfWeek: [], status: 'active' }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Schedule
                </button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by route or bus..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none" />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                        <tr>
                            <th className="text-left px-5 py-3 font-medium">Route</th>
                            <th className="text-left px-5 py-3 font-medium">Bus</th>
                            <th className="text-left px-5 py-3 font-medium">Departure</th>
                            <th className="text-left px-5 py-3 font-medium">Arrival</th>
                            <th className="text-left px-5 py-3 font-medium">Price</th>
                            <th className="text-left px-5 py-3 font-medium">Days</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-12 text-gray-400">No schedules found</td></tr>
                        ) : filtered.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                                    {s.route?.source} → {s.route?.destination}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{s.bus?.name}</td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />{s.departureTime}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{s.arrivalTime}</td>
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5 text-green-500" />NPR {s.basePrice}
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex gap-0.5 flex-wrap">
                                        {(s.daysOfWeek || []).map(d => (
                                            <span key={d} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] uppercase rounded font-medium">
                                                {d.slice(0, 2)}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>{s.status}</span>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Schedule' : 'Add Schedule'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
                                    <select value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="">Select route</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.source} → {r.destination}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus</label>
                                    <select value={form.busId} onChange={e => setForm({ ...form, busId: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="">Select bus</option>
                                        {buses.map(b => <option key={b.id} value={b.id}>{b.name} ({b.busNumber})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure</label>
                                    <input type="time" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Arrival</label>
                                    <input type="time" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Price</label>
                                    <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: Number(e.target.value) })} min={0}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Days of Week</label>
                                <div className="flex flex-wrap gap-2">
                                    {days.map(d => (
                                        <button key={d} type="button" onClick={() => toggleDay(d)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.daysOfWeek.includes(d) ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                                                }`}>
                                            {d.slice(0, 3).toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                                {editing ? 'Update Schedule' : 'Create Schedule'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
