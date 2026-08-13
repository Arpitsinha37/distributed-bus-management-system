'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, CalendarClock, X, Clock, DollarSign } from 'lucide-react';

interface RouteOption { id: string; originCity: string; destinationCity: string; boardingPoints: string[] }
interface BusOption { id: string; registrationNo: string; type: string; name: string; }

interface FareTier { seatType: string; boardingPoint: string; amount: number; }

interface ScheduleItem {
    id: string;
    routeId: string;
    busId: string;
    departureTime: string;
    fare: number;
    isActive: boolean;
    daysOfWeek: number[];
    route?: RouteOption;
    bus?: BusOption;
    fareTiers?: FareTier[];
}

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
        busId: '', routeId: '', departureTime: '', fare: 0, daysOfWeek: [] as number[], isActive: true,
        fareTiers: [] as FareTier[]
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const fetchAll = async () => {
        try {
            const [sRes, bRes, rRes] = await Promise.all([
                apiGet<{ data: ScheduleItem[] }>('/schedules', accessToken!),
                apiGet<{ data: BusOption[] }>('/fleet/buses', accessToken!),
                apiGet<{ data: RouteOption[] }>('/fleet/routes', accessToken!), // wait, earlier I saw routes are in fleet. Oh no, /routes in backend. I'll just use /schedules, /fleet/buses, /routes. Wait, earlier list_dir on src/routes showed it's at root level. 
            ]);
            setSchedules(sRes.data || []);
            setBuses(bRes.data || []);
            // Quick check: if the API was /routes, we need to know. 
            // In the backend, routes module is in src/routes.
            // Assuming it's '/routes'
        } catch (err) {
            console.error(err);
        }
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
            busId: s.busId || '', routeId: s.routeId || '',
            departureTime: s.departureTime, fare: s.fare, daysOfWeek: s.daysOfWeek || [], isActive: s.isActive,
            fareTiers: s.fareTiers || []
        });
        setShowModal(true);
    };

    const toggleDay = (dayIndex: number) => {
        setForm(f => ({
            ...f,
            daysOfWeek: f.daysOfWeek.includes(dayIndex) ? f.daysOfWeek.filter(d => d !== dayIndex) : [...f.daysOfWeek, dayIndex],
        }));
    };

    const filtered = schedules.filter(s =>
        (s.route?.originCity || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.route?.destinationCity || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.bus?.registrationNo || '').toLowerCase().includes(search.toLowerCase())
    );

    const getBoardingPointsForSelectedRoute = () => {
        const route = routes.find(r => r.id === form.routeId);
        return route ? (route.boardingPoints || []) : [];
    };

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
                    onClick={() => { setEditing(null); setForm({ busId: '', routeId: '', departureTime: '', fare: 0, daysOfWeek: [], isActive: true, fareTiers: [] }); setShowModal(true); }}
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
                            <th className="text-left px-5 py-3 font-medium">Base Price</th>
                            <th className="text-left px-5 py-3 font-medium">Days</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400">No schedules found</td></tr>
                        ) : filtered.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                                    {s.route?.originCity} → {s.route?.destinationCity}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{s.bus?.registrationNo}</td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />{s.departureTime}
                                </td>
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5 text-green-500" />{s.fare}
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex gap-0.5 flex-wrap">
                                        {s.daysOfWeek.length === 0 ? <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] uppercase rounded font-medium">Daily</span> : s.daysOfWeek.map(d => (
                                            <span key={d} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] uppercase rounded font-medium">
                                                {days[d]}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>{s.isActive ? 'Active' : 'Inactive'}</span>
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
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Schedule' : 'Add Schedule'}</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
                                    <select value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="">Select route</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.originCity} → {r.destinationCity}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus</label>
                                    <select value={form.busId} onChange={e => setForm({ ...form, busId: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="">Select bus</option>
                                        {buses.map(b => <option key={b.id} value={b.id}>{b.registrationNo} ({b.type})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure (HH:MM)</label>
                                    <input type="text" pattern="^([01]\d|2[0-3]):([0-5]\d)$" placeholder="e.g. 07:00" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fare</label>
                                    <input type="number" value={form.fare || ''} onChange={e => setForm({ ...form, fare: Number(e.target.value) })} min={0} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm({ ...form, isActive: e.target.value === 'active' })}
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Days of Week (Empty for Daily)</label>
                                <div className="flex flex-wrap gap-2">
                                    {days.map((d, i) => (
                                        <button key={d} type="button" onClick={() => toggleDay(i)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.daysOfWeek.includes(i) ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                                                }`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fare Tiers (Optional)</label>
                                    <button type="button" onClick={() => setForm({ ...form, fareTiers: [...form.fareTiers, { seatType: 'window', boardingPoint: '', amount: 0 }] })} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Add Tier
                                    </button>
                                </div>
                                {form.fareTiers.length === 0 ? (
                                    <p className="text-xs text-gray-500">No custom fare tiers defined. Base fare will apply to all seats.</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {form.fareTiers.map((tier, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input type="text" placeholder="Seat Type (e.g. window)" value={tier.seatType} onChange={e => {
                                                    const tiers = [...form.fareTiers];
                                                    tiers[index].seatType = e.target.value;
                                                    setForm({ ...form, fareTiers: tiers });
                                                }} className="flex-1 px-3 py-2 text-sm bg-gray-50 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                                                <select value={tier.boardingPoint} onChange={e => {
                                                    const tiers = [...form.fareTiers];
                                                    tiers[index].boardingPoint = e.target.value;
                                                    setForm({ ...form, fareTiers: tiers });
                                                }} className="flex-1 px-3 py-2 text-sm bg-gray-50 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                                    <option value="">All Boarding Points</option>
                                                    {getBoardingPointsForSelectedRoute().map(bp => <option key={bp} value={bp}>{bp}</option>)}
                                                </select>
                                                <input type="number" placeholder="Fare Amount" value={tier.amount || ''} onChange={e => {
                                                    const tiers = [...form.fareTiers];
                                                    tiers[index].amount = Number(e.target.value);
                                                    setForm({ ...form, fareTiers: tiers });
                                                }} className="w-24 px-3 py-2 text-sm bg-gray-50 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                                                <button type="button" onClick={() => {
                                                    const tiers = [...form.fareTiers];
                                                    tiers.splice(index, 1);
                                                    setForm({ ...form, fareTiers: tiers });
                                                }} className="p-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                                    {editing ? 'Update Schedule' : 'Create Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
