'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Ticket, X, Calendar, Percent, DollarSign } from 'lucide-react';

interface CouponItem {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FLAT';
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    minBookingAmount: number | null;
    validFrom: string;
    validTo: string;
    isActive: boolean;
    siteId: string | null;
}

export default function CouponsPage() {
    const { accessToken } = useStore();
    const [coupons, setCoupons] = useState<CouponItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<CouponItem | null>(null);
    const [search, setSearch] = useState('');
    
    const [form, setForm] = useState({
        code: '', discountType: 'PERCENTAGE', discountValue: 0,
        maxUses: '', minBookingAmount: '', validFrom: '', validTo: '', isActive: true
    });

    const fetchAll = async () => {
        try {
            const res = await apiGet<{ data: CouponItem[] } | CouponItem[]>('/coupons', accessToken!);
            // Handle if data is wrapped in { data: [] } or just []
            setCoupons(Array.isArray(res) ? res : res.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                maxUses: form.maxUses ? Number(form.maxUses) : null,
                minBookingAmount: form.minBookingAmount ? Number(form.minBookingAmount) : null,
                validFrom: new Date(form.validFrom).toISOString(),
                validTo: new Date(form.validTo).toISOString(),
            };
            if (editing) await apiPut(`/coupons/${editing.id}`, payload, accessToken!);
            else await apiPost('/coupons', payload, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        await apiDelete(`/coupons/${id}`, accessToken!);
        fetchAll();
    };

    const openEdit = (c: CouponItem) => {
        setEditing(c);
        setForm({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            maxUses: c.maxUses ? String(c.maxUses) : '',
            minBookingAmount: c.minBookingAmount ? String(c.minBookingAmount) : '',
            validFrom: new Date(c.validFrom).toISOString().slice(0, 16),
            validTo: new Date(c.validTo).toISOString().slice(0, 16),
            isActive: c.isActive
        });
        setShowModal(true);
    };

    const filtered = coupons.filter(c =>
        (c.code || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-teal-500" /> Coupons & Offers
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage discount codes and promotional campaigns</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ code: '', discountType: 'PERCENTAGE', discountValue: 0, maxUses: '', minBookingAmount: '', validFrom: '', validTo: '', isActive: true }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> Create Coupon
                </button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search coupons by code..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none" />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                        <tr>
                            <th className="text-left px-5 py-3 font-medium">Code</th>
                            <th className="text-left px-5 py-3 font-medium">Discount</th>
                            <th className="text-left px-5 py-3 font-medium">Validity</th>
                            <th className="text-left px-5 py-3 font-medium">Usage</th>
                            <th className="text-left px-5 py-3 font-medium">Min Amount</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400">No coupons found</td></tr>
                        ) : filtered.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    {c.code}
                                </td>
                                <td className="px-5 py-3.5 text-gray-900 dark:text-white font-medium flex items-center gap-1">
                                    {c.discountType === 'PERCENTAGE' ? <Percent className="w-3 h-3 text-blue-500" /> : <DollarSign className="w-3 h-3 text-green-500" />}
                                    {c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : ''}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-1 text-xs"><Calendar className="w-3 h-3" /> {new Date(c.validTo).toLocaleDateString()}</div>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                                    {c.usedCount} / {c.maxUses === null ? '∞' : c.maxUses}
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                                    {c.minBookingAmount ? c.minBookingAmount : 'None'}
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
                            <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                                <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. SUMMER20"
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none uppercase font-semibold tracking-wider" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FLAT">Flat Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Value</label>
                                    <input type="number" value={form.discountValue || ''} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} min={0} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid From</label>
                                    <input type="datetime-local" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid To</label>
                                    <input type="datetime-local" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} required
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses (Optional)</label>
                                    <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} min={1} placeholder="Unlimited"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Booking Amt (Optional)</label>
                                    <input type="number" value={form.minBookingAmount} onChange={e => setForm({ ...form, minBookingAmount: e.target.value })} min={1} placeholder="No minimum"
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm({ ...form, isActive: e.target.value === 'active' })}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
                                    {editing ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
