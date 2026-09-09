'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Save, Loader2 } from 'lucide-react';

const EMPTY = { phone: '', email: '', address: '', facebookUrl: '', instagramUrl: '', twitterUrl: '', whatsapp: '' };

export default function ContactPage() {
    const { authFetch, API_URL } = useAuth();
    const [form, setForm] = useState<any>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        authFetch(`${API_URL}/contact`).then(r => r.json()).then(d => { setForm({ ...EMPTY, ...d }); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        await authFetch(`${API_URL}/contact`, { method: 'PUT', body: JSON.stringify(form) });
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;

    return (
        <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Information</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Update your business contact details and social links</p></div>
                <button onClick={save} disabled={saving} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-gray-900 dark:text-white' : 'bg-red-600 hover:bg-red-700 text-white dark:text-white'}`}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
                <h2 className="text-gray-900 dark:text-white font-semibold">Basic Contact</h2>
                {[['phone', 'Phone Number'], ['email', 'Email Address'], ['whatsapp', 'WhatsApp Number']].map(([k, l]) => (
                    <div key={k}><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{l}</label><input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                ))}
                <div><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Address</label><textarea rows={3} value={form.address || ''} onChange={e => setForm((p: any) => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 resize-none" /></div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4 mt-4">
                <h2 className="text-gray-900 dark:text-white font-semibold">Social Media Links</h2>
                {[['facebookUrl', 'Facebook URL'], ['instagramUrl', 'Instagram URL'], ['twitterUrl', 'Twitter URL']].map(([k, l]) => (
                    <div key={k}><label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{l}</label><input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" /></div>
                ))}
            </div>
        </div>
    );
}
