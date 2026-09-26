'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Route as RouteIcon, X, MapPin } from 'lucide-react';

interface RouteItem { id: string; source: string; destination: string; slug: string; distance?: number; duration?: number; status: string; originCity?: string; destinationCity?: string; distanceKm?: number; durationMinutes?: number; boardingPoints?: string[]; droppingPoints?: string[]; }

// ── Known Nepal Route Data ─────────────────────────────────
const ROUTE_PRESETS: Record<string, { boarding: string[]; dropping: string[]; distanceKm: number; durationMinutes: number }> = {
    'kathmandu→pokhara': {
        boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Bafal Sajha Petrol Pump', 'Kalanki', 'Manakamana', 'Bandipur Dumre'],
        dropping: ['Pokhara', 'Damauli', 'Bandipur Dumre', 'Manakamana'],
        distanceKm: 200, durationMinutes: 390,
    },
    'pokhara→kathmandu': {
        boarding: ['Tourist Bus Park', 'Amarsingh Chowk', 'Damauli', 'Bandipur Dumre', 'Manakamana'],
        dropping: ['Sorhakhutte', 'Balaju', 'Kalanki', 'Manakamana', 'Bandipur Dumre'],
        distanceKm: 200, durationMinutes: 390,
    },
    'kathmandu→sauraha': {
        boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Kalanki'],
        dropping: ['Chitwan', 'Paras Bus Park', 'Sauraha'],
        distanceKm: 150, durationMinutes: 330,
    },
    'sauraha→kathmandu': {
        boarding: ['Chitwan', 'Sauraha', 'Tadi', 'Paras Bus Park', 'Aptari'],
        dropping: ['Kathmandu'],
        distanceKm: 150, durationMinutes: 330,
    },
    'kathmandu→chitwan': {
        boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Kalanki'],
        dropping: ['Chitwan'],
        distanceKm: 150, durationMinutes: 330,
    },
    'chitwan→kathmandu': {
        boarding: ['Chitwan'],
        dropping: ['Sorhakhutte', 'Balaju', 'Kalanki'],
        distanceKm: 150, durationMinutes: 330,
    },
    'kathmandu→lumbini': {
        boarding: ['Sorhakhutte', 'Balaju', 'Swayambhu', 'Kalanki'],
        dropping: ['Lumbini', 'Bhairahawa'],
        distanceKm: 280, durationMinutes: 480,
    },
    'lumbini→kathmandu': {
        boarding: ['Lumbini', 'Bhairahawa'],
        dropping: ['Sorhakhutte', 'Balaju', 'Kalanki'],
        distanceKm: 280, durationMinutes: 480,
    },
};

// ── Chip Input Component ───────────────────────────────────
function ChipInput({ label, chips, suggestions, onChange }: {
    label: string;
    chips: string[];
    suggestions: string[];
    onChange: (chips: string[]) => void;
}) {
    const [input, setInput] = useState('');

    const addChip = (value: string) => {
        const v = value.trim();
        if (v && !chips.includes(v)) {
            onChange([...chips, v]);
        }
        setInput('');
    };

    const removeChip = (chip: string) => {
        onChange(chips.filter(c => c !== chip));
    };

    const toggleSuggestion = (s: string) => {
        if (chips.includes(s)) {
            removeChip(s);
        } else {
            onChange([...chips, s]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>

            {/* Suggestion chips */}
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {suggestions.map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => toggleSuggestion(s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${chips.includes(s)
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-400'
                            }`}
                        >
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {chips.includes(s) ? '✓ ' : ''}{s}
                        </button>
                    ))}
                </div>
            )}

            {/* Active chips (custom ones not in suggestions) */}
            {chips.filter(c => !suggestions.includes(c)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {chips.filter(c => !suggestions.includes(c)).map(c => (
                        <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-600 text-white">
                            {c}
                            <button type="button" onClick={() => removeChip(c)} className="hover:bg-red-700 rounded-full p-0.5">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Add custom */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip(input); } }}
                    placeholder="Add custom point..."
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30"
                />
                <button type="button" onClick={() => addChip(input)} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 rounded-lg text-sm">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════

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

    // Auto-populate from presets when origin/destination changes
    const routeKey = useMemo(() => {
        const o = form.originCity.trim().toLowerCase();
        const d = form.destinationCity.trim().toLowerCase();
        return `${o}→${d}`;
    }, [form.originCity, form.destinationCity]);

    const preset = ROUTE_PRESETS[routeKey] || null;

    const applyPreset = () => {
        if (preset) {
            setForm(f => ({
                ...f,
                boardingPoints: [...preset.boarding],
                droppingPoints: [...preset.dropping],
                distanceKm: preset.distanceKm,
                durationMinutes: preset.durationMinutes,
            }));
        }
    };

    const boardingSuggestions = preset?.boarding || [];
    const droppingSuggestions = preset?.dropping || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) { await apiPatch(`/routes/${editing.id}`, form, accessToken!); }
            else { await apiPost('/routes', form, accessToken!); }
            setShowModal(false); setEditing(null); fetchRoutes();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this route?')) return;
        try {
            await apiDelete(`/routes/${id}`, accessToken!);
            fetchRoutes();
        } catch (err: any) {
            alert(err.message || 'Failed to delete route');
        }
    };

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
                                    <button onClick={() => { setEditing(r); setForm({ originCity: r.originCity || '', destinationCity: r.destinationCity || '', distanceKm: r.distanceKm || 0, durationMinutes: r.durationMinutes || 0, boardingPoints: r.boardingPoints || [], droppingPoints: r.droppingPoints || [] }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Route' : 'Add Route'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Origin & Destination */}
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin City</label><input type="text" value={form.originCity} onChange={e => setForm({ ...form, originCity: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Kathmandu" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination City</label><input type="text" value={form.destinationCity} onChange={e => setForm({ ...form, destinationCity: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="Pokhara" /></div>
                            </div>

                            {/* Auto-fill banner */}
                            {preset && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center justify-between">
                                    <div className="text-sm text-green-700 dark:text-green-400">
                                        <span className="font-semibold">✨ Known route detected!</span> Auto-fill boarding/dropping points and distance?
                                    </div>
                                    <button type="button" onClick={applyPreset} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                                        Auto-fill
                                    </button>
                                </div>
                            )}

                            {/* Distance & Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distance (km)</label><input type="number" value={form.distanceKm || ''} onChange={e => setForm({ ...form, distanceKm: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins)</label><input type="number" value={form.durationMinutes || ''} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="390" /></div>
                            </div>

                            {/* Boarding Points — Chips */}
                            <ChipInput
                                label="Boarding Points"
                                chips={form.boardingPoints}
                                suggestions={boardingSuggestions}
                                onChange={boardingPoints => setForm({ ...form, boardingPoints })}
                            />

                            {/* Dropping Points — Chips */}
                            <ChipInput
                                label="Dropping Points"
                                chips={form.droppingPoints}
                                suggestions={droppingSuggestions}
                                onChange={droppingPoints => setForm({ ...form, droppingPoints })}
                            />

                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm">{editing ? 'Update Route' : 'Create Route'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
