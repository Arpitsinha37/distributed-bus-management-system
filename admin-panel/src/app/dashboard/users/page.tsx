'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Users, X, Shield, Ban, CheckCircle } from 'lucide-react';

interface StaffItem {
    id: string;
    email: string;
    name: string;
    status: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    SITE_MANAGER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    COUNTER_AGENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function UsersPage() {
    const { accessToken } = useStore();
    const [staff, setStaff] = useState<StaffItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<StaffItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ email: '', password: '', name: '', role: 'COUNTER_AGENT', isActive: true });

    const fetchStaff = async () => {
        try {
            const res = await apiGet<{ data: StaffItem[] }>('/staff', accessToken!);
            setStaff(res.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchStaff(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body: any = { ...form };
            if (editing && !body.password) delete body.password;
            if (editing) await apiPatch(`/staff/${editing.id}`, body, accessToken!);
            else await apiPost('/staff', body, accessToken!);
            setShowModal(false); setEditing(null); fetchStaff();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this staff member? This action cannot be undone.')) return;
        await apiDelete(`/staff/${id}`, accessToken!);
        fetchStaff();
    };

    const openEdit = (u: StaffItem) => {
        setEditing(u);
        setForm({ email: u.email, password: '', name: u.name, role: u.role, isActive: u.isActive });
        setShowModal(true);
    };

    const toggleStatus = async (u: StaffItem) => {
        await apiPatch(`/staff/${u.id}`, { isActive: !u.isActive }, accessToken!);
        fetchStaff();
    };

    const filtered = staff.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-cyan-500" /> System Users
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage staff, roles, and access across sites</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ email: '', password: '', name: '', role: 'COUNTER_AGENT', isActive: true }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"><Plus className="w-4 h-4" /> Add User</button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500/30 outline-none" />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                        <tr>
                            <th className="text-left px-5 py-3 font-medium">User</th>
                            <th className="text-left px-5 py-3 font-medium">Email</th>
                            <th className="text-left px-5 py-3 font-medium">Role</th>
                            <th className="text-left px-5 py-3 font-medium">Status</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">No staff found</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                                            {u.name[0]}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{u.email}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                        <Shield className="w-3 h-3 inline-block mr-1" />{u.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>{u.isActive ? 'Active' : 'Suspended'}</span>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => toggleStatus(u)} className="p-1.5 text-gray-400 hover:text-orange-500" title={u.isActive ? 'Suspend' : 'Activate'}>
                                        {u.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit User' : 'Add User'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                            
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                            
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} {...(!editing ? { required: true } : {})}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" minLength={8} /></div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                    <option value="SITE_MANAGER">Site Manager</option>
                                    <option value="COUNTER_AGENT">Counter Agent</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active Account</label>
                            </div>

                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm mt-4">{editing ? 'Update User' : 'Create User'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
