'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, Users, X, Shield, Ban, CheckCircle } from 'lucide-react';

interface UserItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status: string;
    role?: { name: string; displayName: string; };
    tenantId?: string;
    lastLoginAt?: string;
    createdAt: string;
}

const roleColors: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    operator_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    staff: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    driver: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    customer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function UsersPage() {
    const { accessToken } = useStore();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<UserItem | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', roleId: '', status: 'active' });

    const fetchUsers = async () => {
        try {
            const res = await apiGet<{ data: UserItem[] }>('/users', accessToken!);
            setUsers(res.data || []);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body: any = { ...form };
            if (editing && !body.password) delete body.password;
            if (editing) await apiPut(`/users/${editing.id}`, body, accessToken!);
            else await apiPost('/users', body, accessToken!);
            setShowModal(false); setEditing(null); fetchUsers();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user? This action cannot be undone.')) return;
        await apiDelete(`/users/${id}`, accessToken!);
        fetchUsers();
    };

    const openEdit = (u: UserItem) => {
        setEditing(u);
        setForm({ email: u.email, password: '', firstName: u.firstName, lastName: u.lastName, phone: u.phone || '', roleId: '', status: u.status });
        setShowModal(true);
    };

    const toggleStatus = async (u: UserItem) => {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        await apiPut(`/users/${u.id}`, { status: newStatus }, accessToken!);
        fetchUsers();
    };

    const filtered = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-cyan-500" /> User Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage users, roles, and account status</p>
                </div>
                <button onClick={() => { setEditing(null); setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', roleId: '', status: 'active' }); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"><Plus className="w-4 h-4" /> Add User</button>
            </div>

            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
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
                            <th className="text-left px-5 py-3 font-medium">Last Login</th>
                            <th className="text-right px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                                            {u.firstName[0]}{u.lastName[0]}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{u.email}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[u.role?.name || 'customer']}`}>
                                        <Shield className="w-3 h-3 inline-block mr-1" />{u.role?.displayName || u.role?.name}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>{u.status}</span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-400 text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => toggleStatus(u)} className="p-1.5 text-gray-400 hover:text-orange-500" title={u.status === 'active' ? 'Suspend' : 'Activate'}>
                                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
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
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} {...(!editing ? { required: true } : {})}
                                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" minLength={8} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" /></div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm">{editing ? 'Update User' : 'Create User'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
