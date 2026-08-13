'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost } from '@/lib/api';
import { Settings, Save } from 'lucide-react';

interface SiteSetting { id?: string; aboutUsText?: string; contactInfo?: any; termsText?: string; privacyText?: string; }

export default function SiteSettingsPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<SiteSetting>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form
    const [aboutUs, setAboutUs] = useState('');
    const [terms, setTerms] = useState('');
    const [privacy, setPrivacy] = useState('');
    const [contact, setContact] = useState({ phone: '', email: '', address: '', facebookUrl: '', instagramUrl: '' });

    const fetchSettings = async () => {
        try {
            const res = await apiGet<SiteSetting>('/cms/settings', accessToken!);
            if (res) {
                setData(res);
                setAboutUs(res.aboutUsText || '');
                setTerms(res.termsText || '');
                setPrivacy(res.privacyText || '');
                if (res.contactInfo) setContact({ ...contact, ...res.contactInfo });
            }
        } catch {}
        setLoading(false);
    };
    useEffect(() => { fetchSettings(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiPost('/cms/settings', {
                aboutUsText: aboutUs,
                termsText: terms,
                privacyText: privacy,
                contactInfo: contact
            }, accessToken!);
            alert('Settings saved successfully!');
            fetchSettings();
        } catch (err: any) { alert(err.message); }
        setSaving(false);
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-gray-500" /> Site Settings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage global content, contact details, and policies</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm mb-1 font-medium">Primary Phone</label><input type="text" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                        <div><label className="block text-sm mb-1 font-medium">Support Email</label><input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                        <div className="md:col-span-2"><label className="block text-sm mb-1 font-medium">Office Address</label><input type="text" value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                        <div><label className="block text-sm mb-1 font-medium">Facebook Page URL</label><input type="text" value={contact.facebookUrl} onChange={e => setContact({...contact, facebookUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                        <div><label className="block text-sm mb-1 font-medium">Instagram URL</label><input type="text" value={contact.instagramUrl} onChange={e => setContact({...contact, instagramUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                    </div>
                </div>

                {/* About Us */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">About Us Content</h2>
                    <div>
                        <textarea value={aboutUs} onChange={e => setAboutUs(e.target.value)} rows={6} placeholder="Write something about your company..." className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none whitespace-pre-wrap font-mono text-sm" />
                    </div>
                </div>

                {/* Policies */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">Legal & Policies</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1 font-medium">Terms & Conditions</label>
                            <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={5} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none whitespace-pre-wrap font-mono text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-medium">Privacy Policy</label>
                            <textarea value={privacy} onChange={e => setPrivacy(e.target.value)} rows={5} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none whitespace-pre-wrap font-mono text-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors disabled:opacity-50">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
