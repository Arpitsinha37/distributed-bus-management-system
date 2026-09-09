'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Save } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

export default function SiteSettingsPage() {
    const { authFetch, API_URL, token } = useAuth();
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<'settings' | 'seo'>('settings');

    const load = async () => {
        setLoading(true);
        const r = await authFetch(`${API_URL}/site-settings`);
        const d = await r.json();
        setForm(d || {});
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        setSaving(true);
        const { id, updatedAt, ...data } = form;
        await authFetch(`${API_URL}/site-settings`, { method: 'PUT', body: JSON.stringify(data) });
        setSaving(false);
        load();
    };

    if (loading) return <div className="text-slate-400 text-center py-12">Loading site settings...</div>;

    const field = (label: string, key: string, type = 'text', rows = 0) => (
        <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{label}</label>
            {rows > 0 ? (
                <textarea value={form[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))} rows={rows} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
            ) : (
                <input type={type} value={form[key] || ''} onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
            )}
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Settings</h1><p className="text-slate-500 dark:text-slate-400 text-sm">Manage global site configuration</p></div>
                <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</button>
            </div>

            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'settings' ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-white/5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}>Settings</button>
                <button onClick={() => setTab('seo')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'seo' ? 'bg-red-600 text-gray-900 dark:text-white' : 'bg-white/5 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}>SEO</button>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
                {tab === 'settings' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {field('Site Title *', 'siteTitle')}
                            <ImageUpload value={form.logo || ''} onChange={(url) => setForm((p: any) => ({ ...p, logo: url }))} label="Logo" apiUrl={API_URL} token={token} previewClass="h-12 w-auto" />
                        </div>

                        <h3 className="text-gray-900 dark:text-white font-semibold text-sm border-b border-gray-200 dark:border-white/10 pb-2 pt-2">Contact Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Primary Email', 'primaryEmail', 'email')}
                            {field('Alternate Email', 'alternateEmail', 'email')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Phone 1', 'phone1')}
                            {field('Phone 2', 'phone2')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Address 1', 'address1')}
                            {field('Address 2', 'address2')}
                        </div>
                        {field('Map Link', 'mapLink')}

                        <h3 className="text-gray-900 dark:text-white font-semibold text-sm border-b border-gray-200 dark:border-white/10 pb-2 pt-2">Social Media</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Facebook', 'socialFacebook')}
                            {field('Twitter/X', 'socialTwitter')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Instagram', 'socialInstagram')}
                            {field('Youtube', 'socialYoutube')}
                        </div>
                        {field('TikTok', 'socialTiktok')}

                        <h3 className="text-gray-900 dark:text-white font-semibold text-sm border-b border-gray-200 dark:border-white/10 pb-2 pt-2">Video</h3>
                        {field('Video Banner Link (YouTube)', 'videoBannerLink')}
                    </div>
                )}
                {tab === 'seo' && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-gray-900 dark:text-white font-semibold text-sm border-b border-gray-200 dark:border-white/10 pb-2">Global Meta Tags</h3>
                            {field('SEO Title', 'seoTitle')}
                            {field('SEO Keywords', 'seoKeywords')}
                            <ImageUpload value={form.seoImage || ''} onChange={(url) => setForm((p: any) => ({ ...p, seoImage: url }))} label="Default Open Graph Image" apiUrl={API_URL} token={token} />
                            {field('SEO Description', 'seoDescription', 'text', 4)}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/10">
                            <h3 className="text-gray-900 dark:text-white font-semibold text-sm border-b border-gray-200 dark:border-white/10 pb-2">Business Data (JSON-LD Schema)</h3>
                            <p className="text-xs text-slate-500 mb-2">This data is injected into the {`<head>`} of the website to help Google understand your local travel business entity.</p>

                            <div className="grid grid-cols-2 gap-4">
                                {field('Business Name', 'businessName')}
                                {field('Country', 'country')}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {field('Street Address', 'streetAddress')}
                                {field('Locality (City)', 'locality')}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {field('Region', 'region')}
                                {field('Postal Code', 'postalCode')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
