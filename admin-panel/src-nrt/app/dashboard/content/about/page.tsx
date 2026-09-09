'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Save, Loader2 } from 'lucide-react';
import RichEditor from '@/components/RichEditor';

const EMPTY = { companyStory: '', mission: '', vision: '', achievements: '' };

export default function AboutPage() {
    const { authFetch, API_URL } = useAuth();
    const [form, setForm] = useState<any>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        authFetch(`${API_URL}/about`).then(r => r.json()).then(d => {
            setForm({ ...d, achievements: Array.isArray(d.achievements) ? d.achievements.join('\n') : d.achievements || '' });
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        const payload = { ...form, achievements: typeof form.achievements === 'string' ? form.achievements.split('\n').filter(Boolean) : form.achievements };
        delete payload.id; delete payload.createdAt; delete payload.updatedAt;
        await authFetch(`${API_URL}/about`, { method: 'PUT', body: JSON.stringify(payload) });
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">About Us</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Edit your company&apos;s story, mission, and vision</p></div>
                <button onClick={save} disabled={saving} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-gray-900 dark:text-white' : 'bg-red-600 hover:bg-red-700 text-white dark:text-white'}`}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {[['companyStory', 'Company Story'], ['mission', 'Our Mission'], ['vision', 'Our Vision']].map(([k, l]) => (
                    <div key={k} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                        <RichEditor value={form[k] || ''} onChange={(val) => setForm((p: any) => ({ ...p, [k]: val }))} label={l} placeholder={`Enter ${l.toLowerCase()}...`} />
                    </div>
                ))}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                    <RichEditor value={form.achievements || ''} onChange={(val) => setForm((p: any) => ({ ...p, achievements: val }))} label="Achievements" placeholder={"10+ years experience\n50,000+ happy customers\n..."} />
                </div>
            </div>
        </div>
    );
}
