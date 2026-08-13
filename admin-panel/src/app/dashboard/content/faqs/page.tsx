'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ { id: string; question: string; answer: string; isActive: boolean; order: number; }

export default function FaqsPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<FAQ | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ question: '', answer: '', isActive: true, order: 0 });

    const fetchAll = async () => {
        try { const res = await apiGet<FAQ[]>('/cms/faqs', accessToken!); setData(res || []); } catch {} setLoading(false);
    };
    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPatch(`/cms/faqs/${editing.id}`, form, accessToken!);
            else await apiPost('/cms/faqs', form, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return;
        await apiDelete(`/cms/faqs/${id}`, accessToken!); fetchAll();
    };

    const filtered = data.filter(i => i.question.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-indigo-500" /> FAQs
                    </h1>
                </div>
                <button onClick={() => { setEditing(null); setForm({ question: '', answer: '', isActive: true, order: 0 }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add FAQ
                </button>
            </div>
            
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none" />
            </div>

            <div className="space-y-3">
                {loading ? <p className="text-center py-10 text-gray-400">Loading...</p> : filtered.length === 0 ? <p className="text-center py-10 text-gray-400">No FAQs found</p> : filtered.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="text-gray-400 text-xs">#{item.order}</span>
                                    {item.question}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">{item.answer}</p>
                                {!item.isActive && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">INACTIVE</span>}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => { setEditing(item); setForm({ question: item.question, answer: item.answer, isActive: item.isActive, order: item.order }); setShowModal(true); }} className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded hover:text-blue-600"><Pencil className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800"><h2 className="text-lg font-bold">{editing ? 'Edit FAQ' : 'Add FAQ'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                            <div><label className="block text-sm mb-1">Question</label><input type="text" value={form.question} onChange={e => setForm({...form, question: e.target.value})} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            <div><label className="block text-sm mb-1">Answer</label><textarea value={form.answer} onChange={e => setForm({...form, answer: e.target.value})} required rows={4} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none whitespace-pre-wrap" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Order</label><input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                <div><label className="block text-sm mb-1">Status</label><select value={form.isActive ? '1':'0'} onChange={e => setForm({...form, isActive: e.target.value === '1'})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none"><option value="1">Active</option><option value="0">Inactive</option></select></div>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg">{editing ? 'Update' : 'Create'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
