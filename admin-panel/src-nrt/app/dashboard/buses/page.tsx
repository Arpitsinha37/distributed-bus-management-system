'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Bus as BusIcon, X } from 'lucide-react';

interface BusItem {
    id: string;
    name: string;
    busNumber: string;
    type: string;
    totalSeats: number;
    amenities: string[];
    status: string;
}

export default function BusManagementPage() {
    const { accessToken } = useStore();
    const [buses, setBuses] = useState<BusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<BusItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', busNumber: '', type: 'standard', totalSeats: 30, amenities: '' as string });

    const fetchBuses = async () => {
        try {
            const res = await apiGet<{ data: BusItem[] }>('/buses', accessToken!);
            setBuses(res.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchBuses(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = { ...form, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean) };
        try {
            if (editing) {
                await apiPut(`/buses/${editing.id}`, body, accessToken!);
            } else {
                await apiPost('/buses', body, accessToken!);
            }
            setShowModal(false);
            setEditing(null);
            setForm({ name: '', busNumber: '', type: 'standard', totalSeats: 30, amenities: '' });
            fetchBuses();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this bus?')) return;
        await apiDelete(`/buses/${id}`, accessToken!);
        fetchBuses();
    };

    const openEdit = (bus: BusItem) => {
        setEditing(bus);
        setForm({ name: bus.name, busNumber: bus.busNumber, type: bus.type, totalSeats: bus.totalSeats, amenities: bus.amenities?.join(', ') || '' });
        setShowModal(true);
    };

    const filtered = buses.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.busNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BusIcon className="w-6 h-6 text-purple-500" /> Bus Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your fleet of buses</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', busNumber: '', type: 'standard', totalSeats: 30, amenities: '' }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Bus
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search buses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="text-left px-5 py-3 font-medium">Bus Name</th>
                            <th className="text-left px-5 py-3 font-medium">Number</th>
                            <th className="text-left px-5 py-3 font-medium">Type</th>
                            <th className="text-left px-5 py-3 font-medium">Seats</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">No buses found</td></tr>
                        ) : filtered.map((bus) => (
                            <tr key={bus.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{bus.name}</td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{bus.busNumber}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.type === 'deluxe' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            bus.type === 'super_deluxe' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {bus.type}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{bus.totalSeats}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {bus.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => openEdit(bus)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(bus.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Bus' : 'Add New Bus'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus Number</label>
                                <input type="text" value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value })} required placeholder="BA-01-KA-1234" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="standard">Standard</option>
                                        <option value="deluxe">Deluxe</option>
                                        <option value="super_deluxe">Super Deluxe</option>
                                        <option value="ac">AC</option>
                                        <option value="sleeper">Sleeper</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Seats</label>
                                    <input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} min={1} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenities (comma-separated)</label>
                                <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, AC, Charging" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                                {editing ? 'Update Bus' : 'Create Bus'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
