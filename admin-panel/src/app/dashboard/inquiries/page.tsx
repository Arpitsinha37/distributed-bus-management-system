'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function InquiriesPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); const r = await authFetch(`${API_URL}/booking-inquiries`); const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false); };
    useEffect(() => { load(); }, []);
    const toggleSeen = async (item: any) => { await authFetch(`${API_URL}/booking-inquiries/${item.id}/seen`, { method: 'PATCH', body: JSON.stringify({ seen: !item.seen }) }); load(); };
    return (
        <div>
            <div className="mb-6"><h1 className="text-2xl font-bold text-white">Booking Inquiries</h1><p className="text-slate-400 text-sm">Customer booking inquiries from website</p></div>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-white/10"><tr className="text-slate-400"><th className="px-4 py-3 text-left">SN</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Package</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Seen</th></tr></thead><tbody className="divide-y divide-white/5">{loading ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">No inquiries</td></tr> : items.map((item, i) => (<tr key={item.id} className={`hover:bg-white/5 ${!item.seen ? 'bg-red-500/5' : ''}`}><td className="px-4 py-3 text-slate-400">{i + 1}</td><td className="px-4 py-3 text-white font-medium">{item.name}</td><td className="px-4 py-3 text-slate-300">{item.email}</td><td className="px-4 py-3 text-slate-300">{item.phone}</td><td className="px-4 py-3 text-slate-300">{item.packageName || '—'}</td><td className="px-4 py-3 text-slate-300 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><button onClick={() => toggleSeen(item)} className="flex items-center gap-1 text-xs">{item.seen ? <><Eye className="w-4 h-4 text-green-400" /><span className="text-green-400">Seen</span></> : <><EyeOff className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400">Unseen</span></>}</button></td></tr>))}</tbody></table></div>
        </div>
    );
}
