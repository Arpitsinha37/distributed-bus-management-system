'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Bus as BusIcon, X, LayoutGrid, Armchair, Users, AlertTriangle } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

interface SeatLayoutItem {
    id: string;
    name: string;
    totalSeats: number;
    layoutJson: any;
    createdAt: string;
}

interface BusItem {
    id: string;
    registrationNo: string;
    type: string;
    brand?: string;
    model?: string;
    manufacturingYear?: number;
    images: string[];
    amenities: string[];
    ownerName?: string;
    ownerPhone?: string;
    insuranceNo?: string;
    insuranceExpiry?: string;
    fitnessExpiry?: string;
    permitExpiry?: string;
    rcNumber?: string;
    isActive: boolean;
    seatLayoutId: string;
    seatLayout?: SeatLayoutItem;
}

interface CrewItem {
    id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    licenseNo?: string;
    isActive: boolean;
}

// ── Tab definitions ────────────────────────────────────────

const TABS = [
    { key: 'buses', label: 'Buses', icon: BusIcon },
    { key: 'layouts', label: 'Seat Layouts', icon: LayoutGrid },
    { key: 'crew', label: 'Crew Members', icon: Users },
] as const;

type TabKey = typeof TABS[number]['key'];

// ════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════

export default function BusManagementPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('buses');

    return (
        <div>
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BusIcon className="w-6 h-6 text-purple-500" /> Fleet Management
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage your buses and seat layout templates in one place</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 w-fit">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === key
                            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'buses' && <BusesTab />}
            {activeTab === 'layouts' && <SeatLayoutsTab />}
            {activeTab === 'crew' && <CrewMembersTab />}
        </div>
    );
}

// ════════════════════════════════════════════════════════════
// Buses Tab
// ════════════════════════════════════════════════════════════

function BusesTab() {
    const { accessToken } = useStore();
    const [buses, setBuses] = useState<BusItem[]>([]);
    const [layouts, setLayouts] = useState<SeatLayoutItem[]>([]);
    const [expiringDocs, setExpiringDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<BusItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        registrationNo: '', type: 'AC Seater', amenities: '', seatLayoutId: '',
        brand: '', model: '', manufacturingYear: '', ownerName: '', ownerPhone: '',
        rcNumber: '', insuranceNo: '', insuranceExpiry: '', fitnessExpiry: '', permitExpiry: ''
    });

    const fetchData = async () => {
        try {
            const [busRes, layoutRes, expiringRes] = await Promise.all([
                apiGet<{ data: BusItem[] }>('/fleet/buses'),
                apiGet<{ data: SeatLayoutItem[] }>('/fleet/seat-layouts'),
                apiGet<{ data: any[] }>('/fleet/buses/expiring'),
            ]);
            setBuses(busRes.data || []);
            setLayouts(layoutRes.data || []);
            setExpiringDocs(expiringRes.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = {
            registrationNo: form.registrationNo,
            type: form.type,
            amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
            seatLayoutId: form.seatLayoutId,
            brand: form.brand || undefined,
            model: form.model || undefined,
            manufacturingYear: form.manufacturingYear ? Number(form.manufacturingYear) : undefined,
            ownerName: form.ownerName || undefined,
            ownerPhone: form.ownerPhone || undefined,
            rcNumber: form.rcNumber || undefined,
            insuranceNo: form.insuranceNo || undefined,
            insuranceExpiry: form.insuranceExpiry ? new Date(form.insuranceExpiry).toISOString() : undefined,
            fitnessExpiry: form.fitnessExpiry ? new Date(form.fitnessExpiry).toISOString() : undefined,
            permitExpiry: form.permitExpiry ? new Date(form.permitExpiry).toISOString() : undefined,
        };
        try {
            if (editing) {
                await apiPut(`/fleet/buses/${editing.id}`, body);
            } else {
                await apiPost('/fleet/buses', body);
            }
            setShowModal(false);
            setEditing(null);
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this bus?')) return;
        await apiDelete(`/fleet/buses/${id}`);
        fetchData();
    };

    const openEdit = (bus: BusItem) => {
        setEditing(bus);
        setForm({
            registrationNo: bus.registrationNo,
            type: bus.type,
            amenities: bus.amenities?.join(', ') || '',
            seatLayoutId: bus.seatLayoutId,
            brand: bus.brand || '', model: bus.model || '',
            manufacturingYear: bus.manufacturingYear?.toString() || '',
            ownerName: bus.ownerName || '', ownerPhone: bus.ownerPhone || '',
            rcNumber: bus.rcNumber || '', insuranceNo: bus.insuranceNo || '',
            insuranceExpiry: bus.insuranceExpiry ? bus.insuranceExpiry.split('T')[0] : '',
            fitnessExpiry: bus.fitnessExpiry ? bus.fitnessExpiry.split('T')[0] : '',
            permitExpiry: bus.permitExpiry ? bus.permitExpiry.split('T')[0] : '',
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ 
            registrationNo: '', type: 'AC Seater', amenities: '', seatLayoutId: layouts[0]?.id || '',
            brand: '', model: '', manufacturingYear: '', ownerName: '', ownerPhone: '',
            rcNumber: '', insuranceNo: '', insuranceExpiry: '', fitnessExpiry: '', permitExpiry: ''
        });
        setShowModal(true);
    };

    const filtered = buses.filter(b =>
        b.registrationNo.toLowerCase().includes(search.toLowerCase()) ||
        b.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {expiringDocs.length > 0 && (
                <div className="mb-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300">Action Required: Documents Expiring Soon</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
                            {expiringDocs.length} bus(es) have documents (insurance, fitness, or permit) expiring in the next 30 days.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-5">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by registration no or type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors ml-4"
                >
                    <Plus className="w-4 h-4" /> Add Bus
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="text-left px-5 py-3 font-medium">Registration No</th>
                            <th className="text-left px-5 py-3 font-medium">Type</th>
                            <th className="text-left px-5 py-3 font-medium">Seat Layout</th>
                            <th className="text-left px-5 py-3 font-medium">Seats</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">No buses found. Add one to get started.</td></tr>
                        ) : filtered.map((bus) => (
                            <tr key={bus.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{bus.registrationNo}</td>
                                <td className="px-5 py-3.5">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {bus.type}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                                    {bus.seatLayout?.name || '—'}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                                    {bus.seatLayout?.totalSeats || '—'}
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bus.isActive
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {bus.isActive ? 'Active' : 'Inactive'}
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

            {/* Bus Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Bus' : 'Add New Bus'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Basic Details */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Basic Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration No *</label>
                                        <input type="text" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} required placeholder="BA-01-KA-1234" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus Type *</label>
                                        <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required placeholder="AC Sleeper..." className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                                        <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Tata, Ashok Leyland..." className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model / Mfg Year</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" className="w-2/3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                            <input type="number" value={form.manufacturingYear} onChange={(e) => setForm({ ...form, manufacturingYear: e.target.value })} placeholder="YYYY" className="w-1/3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Layout & Amenities */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Features</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seat Layout *</label>
                                        {layouts.length === 0 ? (
                                            <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">No seat layouts yet. Create one in the "Seat Layouts" tab first.</p>
                                        ) : (
                                            <select value={form.seatLayoutId} onChange={(e) => setForm({ ...form, seatLayoutId: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                                <option value="">Select a layout...</option>
                                                {layouts.map(l => (
                                                    <option key={l.id} value={l.id}>{l.name} ({l.totalSeats} seats)</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenities (comma-separated)</label>
                                        <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, AC, Charging, Blanket" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                    </div>
                                </div>
                            </div>

                            {/* Ownership & Documents */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Ownership & Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name</label>
                                        <input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Phone</label>
                                        <input type="text" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RC Number</label>
                                        <input type="text" value={form.rcNumber} onChange={(e) => setForm({ ...form, rcNumber: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance No</label>
                                        <input type="text" value={form.insuranceNo} onChange={(e) => setForm({ ...form, insuranceNo: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insurance Expiry</label>
                                        <input type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fitness Expiry</label>
                                        <input type="date" value={form.fitnessExpiry} onChange={(e) => setForm({ ...form, fitnessExpiry: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route Permit Expiry</label>
                                        <input type="date" value={form.permitExpiry} onChange={(e) => setForm({ ...form, permitExpiry: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={layouts.length === 0} className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors">
                                {editing ? 'Update Bus' : 'Create Bus'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// ════════════════════════════════════════════════════════════
// Seat Layouts Tab
// ════════════════════════════════════════════════════════════

function SeatLayoutsTab() {
    const [layouts, setLayouts] = useState<SeatLayoutItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<SeatLayoutItem | null>(null);
    const [form, setForm] = useState({
        name: '',
        totalSeats: 30,
        columns: 4,       // e.g. 4 = 2+2, 3 = 2+1
        rows: 10,
        aisleAfterCol: 2, // aisle position
    });

    const fetchLayouts = async () => {
        try {
            const res = await apiGet<{ data: SeatLayoutItem[] }>('/fleet/seat-layouts');
            setLayouts(res.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchLayouts(); }, []);

    const generateLayoutJson = () => {
        const seats: any[] = [];
        const leftCols = form.aisleAfterCol;
        const rightCols = form.columns - form.aisleAfterCol;

        let seatCount = 0;
        for (let r = 0; r < form.rows; r++) {
            // Left side: A1, A2, ... 
            for (let c = 0; c < leftCols; c++) {
                seatCount++;
                if (seatCount > form.totalSeats) break;
                seats.push({
                    number: `A${r * leftCols + c + 1}`,
                    row: r,
                    col: c,
                    side: 'left',
                    type: 'seater',
                });
            }
            // Right side: B1, B2, ...
            for (let c = 0; c < rightCols; c++) {
                seatCount++;
                if (seatCount > form.totalSeats) break;
                seats.push({
                    number: `B${r * rightCols + c + 1}`,
                    row: r,
                    col: leftCols + 1 + c, // +1 for aisle
                    side: 'right',
                    type: 'seater',
                });
            }
            if (seatCount >= form.totalSeats) break;
        }

        return {
            columns: form.columns,
            rows: form.rows,
            aisleAfterCol: form.aisleAfterCol,
            seats,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const layoutJson = generateLayoutJson();
        const body = {
            name: form.name,
            totalSeats: form.totalSeats,
            layoutJson,
        };
        try {
            if (editing) {
                await apiPut(`/fleet/seat-layouts/${editing.id}`, body);
            } else {
                await apiPost('/fleet/seat-layouts', body);
            }
            setShowModal(false);
            setEditing(null);
            fetchLayouts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this seat layout? Buses using it will lose their layout reference.')) return;
        try {
            await apiDelete(`/fleet/seat-layouts/${id}`);
            fetchLayouts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openEdit = (layout: SeatLayoutItem) => {
        setEditing(layout);
        const lj = layout.layoutJson || {};
        setForm({
            name: layout.name,
            totalSeats: layout.totalSeats,
            columns: lj.columns || 4,
            rows: lj.rows || 10,
            aisleAfterCol: lj.aisleAfterCol || 2,
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', totalSeats: 30, columns: 4, rows: 10, aisleAfterCol: 2 });
        setShowModal(true);
    };

    // Mini preview of a seat layout
    const LayoutPreview = ({ layout }: { layout: SeatLayoutItem }) => {
        const lj = layout.layoutJson || {};
        const seats = lj.seats || [];
        const cols = lj.columns || 4;
        const aisleAfter = lj.aisleAfterCol || 2;

        if (seats.length === 0) return <span className="text-gray-400 text-xs">No preview</span>;

        const maxRow = Math.max(...seats.map((s: any) => s.row), 0);

        return (
            <div className="flex flex-col gap-0.5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
                {Array.from({ length: maxRow + 1 }).map((_, r) => {
                    const rowSeats = seats.filter((s: any) => s.row === r);
                    return (
                        <div key={r} className="flex gap-0.5 items-center">
                            {Array.from({ length: cols + 1 }).map((_, c) => {
                                if (c === aisleAfter) {
                                    return <div key={`aisle-${c}`} className="w-2" />;
                                }
                                const actualCol = c > aisleAfter ? c : c;
                                const seat = rowSeats.find((s: any) => s.col === actualCol);
                                return (
                                    <div
                                        key={c}
                                        className={`w-4 h-4 rounded-sm text-[6px] flex items-center justify-center font-bold ${seat
                                            ? 'bg-green-500 text-white'
                                            : 'bg-transparent'
                                            }`}
                                    >
                                        {seat ? <Armchair className="w-3 h-3" /> : ''}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500">Reusable seat map templates. Create a layout once and assign it to multiple buses.</p>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors ml-4"
                >
                    <Plus className="w-4 h-4" /> New Layout
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : layouts.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
                    <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No seat layouts yet</p>
                    <p className="text-gray-400 text-sm mb-4">Create a layout template to define seat configurations like 2+1 VIP Sofa, 2+2 Regular, etc.</p>
                    <button onClick={openCreate} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Create First Layout
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {layouts.map(layout => (
                        <div key={layout.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{layout.name}</h3>
                                    <p className="text-sm text-gray-500">{layout.totalSeats} seats</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(layout)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(layout.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <LayoutPreview layout={layout} />
                        </div>
                    ))}
                </div>
            )}

            {/* Layout Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Layout' : 'New Seat Layout'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Layout Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. 2+1 VIP Sofa, 2+2 Regular" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Seats</label>
                                    <input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} min={1} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns (total)</label>
                                    <select value={form.columns} onChange={(e) => setForm({ ...form, columns: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value={3}>3 columns (2+1)</option>
                                        <option value={4}>4 columns (2+2)</option>
                                        <option value={5}>5 columns (3+2)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rows</label>
                                    <input type="number" value={form.rows} onChange={(e) => setForm({ ...form, rows: Number(e.target.value) })} min={1} max={30} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aisle After Column</label>
                                    <input type="number" value={form.aisleAfterCol} onChange={(e) => setForm({ ...form, aisleAfterCol: Number(e.target.value) })} min={1} max={form.columns - 1} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</label>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                                    {Array.from({ length: Math.min(form.rows, 15) }).map((_, r) => {
                                        const leftCols = form.aisleAfterCol;
                                        const rightCols = form.columns - form.aisleAfterCol;
                                        return (
                                            <div key={r} className="flex gap-1 items-center mb-1">
                                                {Array.from({ length: leftCols }).map((_, c) => (
                                                    <div key={`l${c}`} className="w-7 h-6 bg-green-500 rounded text-[8px] text-white flex items-center justify-center font-bold">
                                                        A{r * leftCols + c + 1}
                                                    </div>
                                                ))}
                                                <div className="w-4" /> {/* Aisle */}
                                                {Array.from({ length: rightCols }).map((_, c) => (
                                                    <div key={`r${c}`} className="w-7 h-6 bg-green-500 rounded text-[8px] text-white flex items-center justify-center font-bold">
                                                        B{r * rightCols + c + 1}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                                {editing ? 'Update Layout' : 'Create Layout'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// ════════════════════════════════════════════════════════════
// Crew Members Tab
// ════════════════════════════════════════════════════════════

function CrewMembersTab() {
    const [crew, setCrew] = useState<CrewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<CrewItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        role: 'DRIVER',
        licenseNo: '',
        isActive: true,
    });

    const fetchCrew = async () => {
        try {
            const res = await apiGet<{ data: CrewItem[] }>('/crew');
            setCrew(res.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchCrew(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await apiPut(`/crew/${editing.id}`, form);
            } else {
                await apiPost('/crew', form);
            }
            setShowModal(false);
            setEditing(null);
            fetchCrew();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this crew member?')) return;
        await apiDelete(`/crew/${id}`);
        fetchCrew();
    };

    const openEdit = (member: CrewItem) => {
        setEditing(member);
        setForm({
            name: member.name,
            phone: member.phone,
            email: member.email || '',
            role: member.role,
            licenseNo: member.licenseNo || '',
            isActive: member.isActive,
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', phone: '', email: '', role: 'DRIVER', licenseNo: '', isActive: true });
        setShowModal(true);
    };

    const filtered = crew.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="flex items-center justify-between mb-5">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors ml-4"
                >
                    <Plus className="w-4 h-4" /> Add Crew Member
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="text-left px-5 py-3 font-medium">Name</th>
                            <th className="text-left px-5 py-3 font-medium">Role</th>
                            <th className="text-left px-5 py-3 font-medium">Phone</th>
                            <th className="text-left px-5 py-3 font-medium">License / ID</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">No crew members found.</td></tr>
                        ) : filtered.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{c.name}</td>
                                <td className="px-5 py-3.5">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                        {c.role}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{c.phone}</td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{c.licenseNo || '—'}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.isActive
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {c.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Crew Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Crew Member' : 'Add Crew Member'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="DRIVER">Driver</option>
                                        <option value="HELPER">Helper</option>
                                        <option value="CONDUCTOR">Conductor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License No (Optional)</label>
                                <input type="text" value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} placeholder="Required for drivers" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/30" />
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active (Available for duty)</label>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors mt-4">
                                {editing ? 'Update' : 'Add Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
