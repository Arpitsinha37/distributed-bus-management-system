'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Check, X, Clock } from 'lucide-react';

export default function PartnerRequestsPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); const r = await authFetch(`${API_URL}/partner-requests`); const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false); };
    useEffect(() => { load(); }, []);
    const updateStatus = async (id: string, status: string) => { await authFetch(`${API_URL}/partner-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); };
    const statusBadge = (s: string) => {
        if (s === 'approved') return <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Approved</span>;
        if (s === 'rejected') return <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Rejected</span>;
        return <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">Pending</span>;
    };
    return (
        <div>
            <div className="mb-6"><h1 className="text-2xl font-bold text-white">Partner Requests</h1><p className="text-slate-400 text-sm">Manage partnership requests</p></div>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-white/10"><tr className="text-slate-400"><th className="px-4 py-3 text-left">SN</th><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Company</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{loading ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">No partner requests</td></tr> : items.map((item, i) => (<tr key={item.id} className="hover:bg-white/5"><td className="px-4 py-3 text-slate-400">{i + 1}</td><td className="px-4 py-3 text-white font-medium">{item.name}</td><td className="px-4 py-3 text-slate-300">{item.email}</td><td className="px-4 py-3 text-slate-300">{item.company || '—'}</td><td className="px-4 py-3 text-slate-300">{item.phone || '—'}</td><td className="px-4 py-3">{statusBadge(item.status)}</td><td className="px-4 py-3"><div className="flex gap-1 justify-end">{item.status === 'pending' && <><button onClick={() => updateStatus(item.id, 'approved')} className="p-1.5 hover:bg-green-500/20 rounded text-green-400" title="Approve"><Check className="w-4 h-4" /></button><button onClick={() => updateStatus(item.id, 'rejected')} className="p-1.5 hover:bg-red-500/20 rounded text-red-400" title="Reject"><X className="w-4 h-4" /></button></>}{item.status !== 'pending' && <button onClick={() => updateStatus(item.id, 'pending')} className="p-1.5 hover:bg-yellow-500/20 rounded text-yellow-400" title="Reset"><Clock className="w-4 h-4" /></button>}</div></td></tr>))}</tbody></table></div>
        </div>
    );
}
