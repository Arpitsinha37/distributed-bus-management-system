'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import useStore from '@/lib/store';
import ImageUpload from '@/components/ImageUpload';

interface CrewMember {
    id: string;
    name: string;
    phone: string;
    email?: string;
    licenseNo?: string;
    licenseExpiry?: string;
    address?: string;
    emergencyPhone?: string;
    role: 'DRIVER' | 'HELPER' | 'CONDUCTOR';
    photoUrl?: string;
    isActive: boolean;
    createdAt: string;
}

export default function StaffPage() {
    const { accessToken } = useStore();
    const [staff, setStaff] = useState<CrewMember[]>([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<CrewMember | null>(null);

    const [form, setForm] = useState<Partial<CrewMember>>({
        name: '',
        phone: '',
        email: '',
        licenseNo: '',
        licenseExpiry: '',
        address: '',
        emergencyPhone: '',
        role: 'DRIVER',
        photoUrl: '',
        isActive: true,
    });

    useEffect(() => {
        if (accessToken) fetchStaff();
    }, [accessToken]);

    const fetchStaff = async () => {
        const res = await apiGet('/crew', accessToken!);
        if (res.error) alert(res.error);
        else setStaff(res.data);
    };

    const openModal = (staffMember?: CrewMember) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setForm({ ...staffMember });
        } else {
            setEditingStaff(null);
            setForm({
                name: '',
                phone: '',
                email: '',
                licenseNo: '',
                licenseExpiry: '',
                address: '',
                emergencyPhone: '',
                role: 'DRIVER',
                photoUrl: '',
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clean empty strings to undefined for optional fields
        const payload = { ...form };
        if (!payload.email) delete payload.email;
        if (!payload.licenseNo) delete payload.licenseNo;
        if (!payload.licenseExpiry) delete payload.licenseExpiry;
        if (!payload.address) delete payload.address;
        if (!payload.emergencyPhone) delete payload.emergencyPhone;
        if (!payload.photoUrl) delete payload.photoUrl;

        if (editingStaff) {
            await apiPatch(`/crew/${editingStaff.id}`, payload, accessToken!);
        } else {
            await apiPost('/crew', payload, accessToken!);
        }
        setIsModalOpen(false);
        fetchStaff();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this staff member?')) return;
        await apiDelete(`/crew/${id}`, accessToken!);
        fetchStaff();
    };

    const filtered = staff.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.phone.includes(search) ||
        s.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-brand-500" /> Staff & Team Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage drivers, conductors, and internal staff.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/30 text-sm font-medium hover:bg-brand-600 transition-colors flex items-center gap-2 w-fit"
                >
                    <Plus className="w-4 h-4" /> Add Staff Member
                </button>
            </div>
            
            {/* Search */}
            <div className="mb-6 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by name, phone, or role..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                />
            </div>

            {/* Table */}
            <div className="glass-card overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                            <th className="p-4 font-medium">Staff Member</th>
                            <th className="p-4 font-medium">Contact</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No staff members found.</td>
                            </tr>
                        ) : (
                            filtered.map(s => (
                                <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {s.photoUrl ? (
                                                <img src={s.photoUrl} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                                                    {s.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                                {s.licenseNo && <div className="text-xs text-gray-500 mt-0.5">Lic: {s.licenseNo}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">{s.phone}</div>
                                        {s.email && <div className="text-xs text-gray-500 mt-0.5">{s.email}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {s.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {s.isActive ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openModal(s)} className="p-2 text-gray-400 hover:text-brand-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo (Optional)</label>
                                    <ImageUpload
                                        value={form.photoUrl || ''}
                                        onChange={(url) => setForm({...form, photoUrl: url})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                    <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value as any})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm">
                                        <option value="DRIVER">Driver</option>
                                        <option value="CONDUCTOR">Conductor</option>
                                        <option value="HELPER">Helper</option>
                                    </select>
                                </div>

                                {/* Driver Specific Fields */}
                                {form.role === 'DRIVER' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Number</label>
                                            <input type="text" value={form.licenseNo || ''} onChange={e => setForm({...form, licenseNo: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Expiry</label>
                                            <input type="date" value={form.licenseExpiry ? form.licenseExpiry.split('T')[0] : ''} onChange={e => setForm({...form, licenseExpiry: e.target.value ? new Date(e.target.value).toISOString() : ''})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
                                    <input type="text" value={form.emergencyPhone || ''} onChange={e => setForm({...form, emergencyPhone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                        <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded text-brand-500 focus:ring-brand-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Active (Available for trips)</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Address</label>
                                    <textarea rows={2} value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm" />
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/30 text-sm font-medium hover:bg-brand-600 transition-colors">
                                    {editingStaff ? 'Save Changes' : 'Create Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
