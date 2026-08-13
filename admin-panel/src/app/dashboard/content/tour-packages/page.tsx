'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/useDebounce';
import { useAuth } from '@/lib/useAuth';
import {
    Plus, Pencil, Trash2, Search, Star, ChevronLeft, Eye, Upload,
    FileText, Camera, Globe, X, Image as ImageIcon, MapPin, Clock, Users as UsersIcon, HelpCircle
} from 'lucide-react';
import RichEditor from '@/components/RichEditor';

const EMPTY = {
    title: '', slug: '', description: '', price: '', duration: '', itinerary: [], featured: false,
    status: 'active', includedServices: '', excludedServices: '', image: '', highlights: '',
    difficulty: '', maxGroupSize: '', startLocation: '', endLocation: '', galleryImages: [],
    seoTitle: '', seoDescription: '', seoKeywords: '', faqs: [],
};

type TabKey = 'package' | 'itinerary' | 'gallery' | 'seo' | 'faqs';

export default function TourPackagesPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [activeTab, setActiveTab] = useState<TabKey>('package');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const API_BASE = API_URL.replace('/api', '');
    const getImageUrl = (url: string) => { if (!url) return ''; return url.startsWith('data:') || url.startsWith('http') ? url : `${API_BASE}${url}`; };

    const load = async () => {
        setLoading(true);
        try {
            const r = await authFetch(`${API_URL}/tour-packages?status=all&search=${debouncedSearch}&limit=100`);
            const d = await r.json(); setItems(Array.isArray(d) ? d : []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };
    useEffect(() => { load(); }, [debouncedSearch]);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const save = async () => {
        setSaving(true);
        try {
            const slug = form.slug || generateSlug(form.title);
            const payload = {
                ...form,
                slug,
                price: parseFloat(form.price) || 0,
                maxGroupSize: form.maxGroupSize ? parseInt(form.maxGroupSize) : null,
                includedServices: typeof form.includedServices === 'string' ? form.includedServices.split('\n').filter(Boolean) : form.includedServices,
                excludedServices: typeof form.excludedServices === 'string' ? form.excludedServices.split('\n').filter(Boolean) : form.excludedServices,
                highlights: typeof form.highlights === 'string' ? form.highlights.split('\n').filter(Boolean) : form.highlights,
                itinerary: Array.isArray(form.itinerary) ? form.itinerary : [],
                faqs: Array.isArray(form.faqs) ? form.faqs : [],
            };
            delete payload.id; delete payload.createdAt; delete payload.updatedAt;

            if (editing) { await authFetch(`${API_URL}/tour-packages/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
            else { await authFetch(`${API_URL}/tour-packages`, { method: 'POST', body: JSON.stringify(payload) }); }
            setEditMode(false); setEditing(null); setForm(EMPTY); load();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const del = async (id: string) => {
        if (!confirm('Delete this package?')) return; try {
            const res = await authFetch(`${API_URL}/tour-packages/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch (e) { console.error('Delete error', e); alert('Failed to delete.'); } load();
    };

    const edit = (item: any) => {
        setEditing(item);
        setForm({
            ...item, price: String(item.price), maxGroupSize: item.maxGroupSize ? String(item.maxGroupSize) : '',
            includedServices: Array.isArray(item.includedServices) ? item.includedServices.join('\n') : item.includedServices || '',
            excludedServices: Array.isArray(item.excludedServices) ? item.excludedServices.join('\n') : item.excludedServices || '',
            highlights: Array.isArray(item.highlights) ? item.highlights.join('\n') : item.highlights || '',
            slug: item.slug || '',
            seoTitle: item.seoTitle || '', seoDescription: item.seoDescription || '', seoKeywords: item.seoKeywords || '',
            itinerary: Array.isArray(item.itinerary) ? item.itinerary : [],
            galleryImages: Array.isArray(item.galleryImages) ? item.galleryImages : [],
            faqs: (() => { try { return typeof item.faqs === 'string' ? JSON.parse(item.faqs) : (Array.isArray(item.faqs) ? item.faqs : []); } catch { return []; } })(),
        });
        setActiveTab('package');
        setEditMode(true);
    };

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'package', label: 'Package', icon: FileText },
        { key: 'itinerary', label: 'Itinerary', icon: MapPin },
        { key: 'gallery', label: 'Gallery', icon: Camera },
        { key: 'seo', label: 'SEO', icon: Globe },
        { key: 'faqs', label: 'FAQs', icon: HelpCircle },
    ];

    // ═══════════════ EDIT MODE ═══════════════
    if (editMode) {
        return (
            <div className="min-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setEditMode(false); setEditing(null); setForm(EMPTY); }}
                            className="flex items-center gap-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white text-sm transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Packages
                        </button>
                        <span className="text-gray-300 dark:text-slate-600">/</span>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white">{editing ? 'Edit Package' : 'New Package'}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {editing && (
                            <a href={`https://www.newroadtravels.com/tours/${form.slug}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                                <Eye className="w-4 h-4" /> Browse in Website
                            </a>
                        )}
                        <button onClick={save} disabled={saving}
                            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                            {saving ? 'Saving...' : 'Update'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-white/5 rounded-lg p-1 w-fit">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-red-600 text-gray-900 dark:text-white shadow-lg'
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                    {activeTab === 'package' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                                <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">ℹ️ Preferred Image Sizes</p>
                                <p className="text-blue-600/70 dark:text-slate-400 text-xs mt-1">
                                    For Card Image: <span className="text-blue-700 dark:text-blue-300 font-mono">Aspect Ratio: 5/3 or 5/4</span> &nbsp;|&nbsp;
                                    For Package Detail Page Banner: <span className="text-blue-700 dark:text-blue-300 font-mono">Aspect Ratio: 16/9</span>
                                </p>
                            </div>

                            {/* Title + Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">TITLE *</label>
                                    <input value={form.title || ''} onChange={e => {
                                        const title = e.target.value;
                                        setForm((p: any) => ({ ...p, title, slug: editing ? p.slug : generateSlug(title) }));
                                    }} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500"
                                        placeholder="Annapurna Trekking Package" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SLUG *</label>
                                    <input value={form.slug || ''} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-900 dark:text-white/60 text-sm focus:outline-none focus:border-red-500 font-mono" />
                                </div>
                            </div>

                            {/* Trip Facts */}
                            <div className="p-4 bg-green-50 dark:bg-gradient-to-r dark:from-green-500/5 dark:to-emerald-500/5 border border-green-200 dark:border-green-500/20 rounded-xl">
                                <h3 className="text-green-700 dark:text-green-400 text-sm font-bold mb-4 uppercase tracking-wider">Trip Facts</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">DURATION *</label>
                                        <input value={form.duration || ''} onChange={e => setForm((p: any) => ({ ...p, duration: e.target.value }))}
                                            placeholder="9 Days"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">DIFFICULTY</label>
                                        <select value={form.difficulty || ''} onChange={e => setForm((p: any) => ({ ...p, difficulty: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500">
                                            <option value="">—</option>
                                            <option value="easy">Easy</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="challenging">Challenging</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">PRICE (Rs.) *</label>
                                        <input type="number" value={form.price || ''} onChange={e => setForm((p: any) => ({ ...p, price: e.target.value }))}
                                            placeholder="2390"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">MAX GROUP SIZE</label>
                                        <input type="number" value={form.maxGroupSize || ''} onChange={e => setForm((p: any) => ({ ...p, maxGroupSize: e.target.value }))}
                                            placeholder="25"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">START POINT</label>
                                        <input value={form.startLocation || ''} onChange={e => setForm((p: any) => ({ ...p, startLocation: e.target.value }))}
                                            placeholder="Kathmandu"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">END POINT</label>
                                        <input value={form.endLocation || ''} onChange={e => setForm((p: any) => ({ ...p, endLocation: e.target.value }))}
                                            placeholder="Kathmandu"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">STATUS</label>
                                        <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-green-500">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Checkboxes */}
                            <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-200 dark:border-white/5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.featured || false} onChange={e => setForm((p: any) => ({ ...p, featured: e.target.checked }))}
                                        className="w-4 h-4 accent-red-500 rounded" />
                                    <span className="text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm">⭐ Is Featured</span>
                                </label>
                            </div>

                            {/* Includes / Excludes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">INCLUDES * (one per line)</label>
                                    <div className="border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden">
                                        <RichEditor value={form.includedServices || ''} onChange={(val) => setForm((p: any) => ({ ...p, includedServices: val }))} label="" placeholder="Airport transfers\n2 nights hotel in Kathmandu\nAll meals during trekking\nExperienced guide\nPorter service" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">EXCLUDES * (one per line)</label>
                                    <div className="border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden">
                                        <RichEditor value={form.excludedServices || ''} onChange={(val) => setForm((p: any) => ({ ...p, excludedServices: val }))} label="" placeholder="International flights\nNepal visa fees\nTravel insurance\nPersonal expenses\nTips for guide" />
                                    </div>
                                </div>
                            </div>

                            {/* Highlights */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">TRIP HIGHLIGHTS (one per line)</label>
                                <div className="border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden">
                                    <RichEditor value={form.highlights || ''} onChange={(val) => setForm((p: any) => ({ ...p, highlights: val }))} label="" placeholder="Stunning mountain views\nAuthentic cultural experience\nProfessional guided trek" />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">DESCRIPTION</label>
                                <div className="border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden">
                                    <RichEditor value={form.description || ''} onChange={(val) => setForm((p: any) => ({ ...p, description: val }))} label="" placeholder="Detailed description of the tour package..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'itinerary' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                <div>
                                    <h3 className="text-blue-800 dark:text-blue-300 font-bold text-sm mb-1">Trip Itinerary</h3>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Manage day-by-day trip details including title, elevation, and description.</p>
                                </div>
                                <button type="button" onClick={() => {
                                    const nextDay = (form.itinerary?.length || 0) + 1;
                                    setForm((p: any) => ({
                                        ...p,
                                        itinerary: [...(p.itinerary || []), { id: Date.now().toString(), day: nextDay, title: '', elevation: '', description: '' }]
                                    }));
                                }} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> Add Day
                                </button>
                            </div>

                            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-indigo-500 text-white dark:bg-indigo-600 uppercase text-xs font-semibold">
                                            <tr>
                                                <th className="px-4 py-3 w-16 text-center">Day</th>
                                                <th className="px-4 py-3 min-w-[200px]">Title</th>
                                                <th className="px-4 py-3 w-32">Elevation (m)</th>
                                                <th className="px-4 py-3 min-w-[250px]">Short Description</th>
                                                <th className="px-4 py-3 w-20 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                            {(!form.itinerary || form.itinerary.length === 0) ? (
                                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">No itinerary days added yet. Click "Add Day" to begin.</td></tr>
                                            ) : (
                                                form.itinerary.map((dayItem: any, idx: number) => (
                                                    <tr key={dayItem.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-4 py-3 align-top">
                                                            <input type="number" value={dayItem.day} onChange={(e) => {
                                                                const newItin = [...form.itinerary];
                                                                newItin[idx].day = parseInt(e.target.value) || 0;
                                                                setForm((p: any) => ({ ...p, itinerary: newItin }));
                                                            }} className="w-16 px-2 py-1.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded text-center focus:outline-none focus:border-indigo-500" />
                                                        </td>
                                                        <td className="px-4 py-3 align-top">
                                                            <input type="text" value={dayItem.title} onChange={(e) => {
                                                                const newItin = [...form.itinerary];
                                                                newItin[idx].title = e.target.value;
                                                                setForm((p: any) => ({ ...p, itinerary: newItin }));
                                                            }} placeholder="e.g. Arrival in Kathmandu" className="w-full px-3 py-1.5 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors" />
                                                        </td>
                                                        <td className="px-4 py-3 align-top">
                                                            <input type="text" value={dayItem.elevation} onChange={(e) => {
                                                                const newItin = [...form.itinerary];
                                                                newItin[idx].elevation = e.target.value;
                                                                setForm((p: any) => ({ ...p, itinerary: newItin }));
                                                            }} placeholder="1400" className="w-full px-3 py-1.5 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors" />
                                                        </td>
                                                        <td className="px-4 py-3 align-top">
                                                            <textarea rows={2} value={dayItem.description} onChange={(e) => {
                                                                const newItin = [...form.itinerary];
                                                                newItin[idx].description = e.target.value;
                                                                setForm((p: any) => ({ ...p, itinerary: newItin }));
                                                            }} placeholder="Brief description of the day's activities..." className="w-full px-3 py-1.5 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none resize-none transition-colors" />
                                                        </td>
                                                        <td className="px-4 py-3 align-top text-center">
                                                            <div className="flex justify-center mt-1">
                                                                <button type="button" onClick={() => {
                                                                    setForm((p: any) => ({
                                                                        ...p,
                                                                        itinerary: p.itinerary.filter((_: any, i: number) => i !== idx)
                                                                    }));
                                                                }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-8">
                            {/* Cover Image Section */}
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-4">Cover Image</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        {/* Upload Button */}
                                        {editing && (
                                            <button type="button" onClick={() => {
                                                const inp = document.createElement('input');
                                                inp.type = 'file'; inp.accept = 'image/*';
                                                inp.onchange = async (e: any) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setUploading(true);
                                                    try {
                                                        const token = localStorage.getItem('cms_token');
                                                        const fd = new FormData();
                                                        fd.append('file', file);
                                                        const res = await fetch(`${API_URL}/tour-packages/${editing.id}/upload-cover`, {
                                                            method: 'POST',
                                                            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                                            body: fd,
                                                        });
                                                        const data = await res.json();
                                                        if (data.url) setForm((p: any) => ({ ...p, image: data.url }));
                                                    } catch (err) { console.error(err); }
                                                    setUploading(false);
                                                };
                                                inp.click();
                                            }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
                                                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Cover Image'}
                                            </button>
                                        )}

                                        {/* OR URL input */}
                                        <div className="relative">
                                            <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Or paste external URL</label>
                                            <input value={form.image || ''} onChange={e => setForm((p: any) => ({ ...p, image: e.target.value }))}
                                                placeholder="https://images.unsplash.com/..."
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                        </div>

                                        {/* Cover Preview */}
                                        {form.image && (
                                            <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                                                <img src={getImageUrl(form.image)}
                                                    alt="Cover preview" className="w-full h-48 object-cover" />
                                                <button onClick={() => setForm((p: any) => ({ ...p, image: '' }))}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                    <X className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Preview */}
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-2">CARD PREVIEW</label>
                                        <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                                            {form.image ? (
                                                <>
                                                    <div className="h-40 overflow-hidden"><img src={getImageUrl(form.image)} alt="" className="w-full h-full object-cover" /></div>
                                                    <div className="p-4">
                                                        <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{form.title || 'Package Title'}</h3>
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-slate-400">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {form.duration || '—'}</span>
                                                            <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" /> {form.maxGroupSize || '—'}</span>
                                                            <span className="font-bold text-red-600 dark:text-red-400">NPR {form.price || '—'}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-slate-600">
                                                    <div className="text-center"><ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-xs">Add a cover image</p></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Images Section */}
                            <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">Gallery Images</h3>
                                        <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">Add multiple images to showcase this package</p>
                                    </div>
                                    {editing && (
                                        <button type="button" onClick={() => {
                                            const inp = document.createElement('input');
                                            inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
                                            inp.onchange = async (e: any) => {
                                                const files = e.target.files;
                                                if (!files?.length) return;
                                                setUploading(true);
                                                const token = localStorage.getItem('cms_token');
                                                for (const file of files) {
                                                    try {
                                                        const fd = new FormData();
                                                        fd.append('file', file);
                                                        const res = await fetch(`${API_URL}/tour-packages/${editing.id}/upload-gallery`, {
                                                            method: 'POST',
                                                            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                                            body: fd,
                                                        });
                                                        const data = await res.json();
                                                        if (data.url) {
                                                            setForm((p: any) => ({
                                                                ...p,
                                                                galleryImages: [...(p.galleryImages || []), data.url]
                                                            }));
                                                        }
                                                    } catch (err) { console.error(err); }
                                                }
                                                setUploading(false);
                                            };
                                            inp.click();
                                        }} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                                            <Plus className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Add Images'}
                                        </button>
                                    )}
                                </div>

                                {(form.galleryImages && form.galleryImages.length > 0) ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {form.galleryImages.map((img: string, i: number) => (
                                            <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-[4/3]">
                                                <img src={img.startsWith('/uploads') ? getImageUrl(img) : img} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <button type="button" onClick={async () => {
                                                        if (!editing || !confirm('Remove this image?')) return;
                                                        try {
                                                            await authFetch(`${API_URL}/tour-packages/${editing.id}/remove-gallery-image`, {
                                                                method: 'POST', body: JSON.stringify({ imageUrl: img }),
                                                            });
                                                            setForm((p: any) => ({
                                                                ...p,
                                                                galleryImages: (p.galleryImages || []).filter((g: string) => g !== img)
                                                            }));
                                                        } catch (err) { console.error(err); }
                                                    }} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                                                        <Trash2 className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                                        <p className="text-sm text-gray-500 dark:text-slate-400">No gallery images yet</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Save the package first, then add gallery images</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                                <p className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-2"><Globe className="w-4 h-4" /> Search Engine Optimization</p>
                                <p className="text-blue-600/70 dark:text-slate-400 text-xs mt-1">Optimize this page for search engines.</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SEO TITLE</label>
                                <input value={form.seoTitle || ''} onChange={e => setForm((p: any) => ({ ...p, seoTitle: e.target.value }))}
                                    placeholder={`${form.title || 'Package'} — Nepal Tour | New Road Travels`}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                                <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{(form.seoTitle || '').length}/60 characters</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SEO DESCRIPTION</label>
                                <textarea rows={3} value={form.seoDescription || ''} onChange={e => setForm((p: any) => ({ ...p, seoDescription: e.target.value }))}
                                    placeholder="Book this amazing tour package..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
                                <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{(form.seoDescription || '').length}/160 characters</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SEO KEYWORDS</label>
                                <input value={form.seoKeywords || ''} onChange={e => setForm((p: any) => ({ ...p, seoKeywords: e.target.value }))}
                                    placeholder="nepal trek, annapurna, tour package"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-3">GOOGLE PREVIEW</label>
                                <div className="bg-white rounded-xl p-5 max-w-xl border border-gray-200">
                                    <p className="text-blue-700 text-lg font-medium leading-tight truncate">{form.seoTitle || form.title || 'Page Title'}</p>
                                    <p className="text-green-700 text-xs mt-1 truncate">www.newroadtravels.com/tours/{form.slug || 'slug'}</p>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{form.seoDescription || form.description?.substring(0, 160) || 'Page description...'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'faqs' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                <div>
                                    <h3 className="text-blue-800 dark:text-blue-300 font-bold text-sm mb-1">Frequently Asked Questions</h3>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Add common questions and answers for this tour.</p>
                                </div>
                                <button type="button" onClick={() => {
                                    setForm((p: any) => ({
                                        ...p,
                                        faqs: [...(p.faqs || []), { question: '', answer: '' }]
                                    }));
                                }} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> Add FAQ
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(!form.faqs || form.faqs.length === 0) ? (
                                    <div className="text-center py-8 border border-dashed border-gray-300 dark:border-white/10 rounded-xl text-gray-400 italic">No FAQs added yet.</div>
                                ) : (
                                    form.faqs.map((faq: any, idx: number) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 relative group">
                                            <button type="button" onClick={() => {
                                                setForm((p: any) => ({
                                                    ...p,
                                                    faqs: p.faqs.filter((_: any, i: number) => i !== idx)
                                                }));
                                            }} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            
                                            <div className="space-y-4 pr-10">
                                                <div>
                                                    <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Question</label>
                                                    <input type="text" value={faq.question} onChange={(e) => {
                                                        const newFaqs = [...form.faqs];
                                                        newFaqs[idx].question = e.target.value;
                                                        setForm((p: any) => ({ ...p, faqs: newFaqs }));
                                                    }} placeholder="e.g. What is the best time for this tour?" className="w-full px-3 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded focus:outline-none focus:border-indigo-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Answer</label>
                                                    <div className="border border-gray-200 dark:border-white/10 rounded overflow-hidden">
                                                        <RichEditor value={faq.answer} onChange={(val) => {
                                                            const newFaqs = [...form.faqs];
                                                            newFaqs[idx].answer = val;
                                                            setForm((p: any) => ({ ...p, faqs: newFaqs }));
                                                        }} label="" placeholder="Detailed answer..." />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
                    <button onClick={() => { setEditMode(false); setEditing(null); setForm(EMPTY); }}
                        className="px-5 py-2.5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-700 dark:text-slate-300 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={save} disabled={saving}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white dark:text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                        {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        );
    }

    // ═══════════════ LIST MODE ═══════════════
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-white">Tour Packages</h1>
                    <p className="text-gray-500 dark:text-slate-500 dark:text-slate-400 text-sm">Manage tour package offerings</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setActiveTab('package'); setEditMode(true); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Package
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search packages..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:border-red-500" />
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent">
                        <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Duration</th>
                            <th className="px-4 py-3 text-left">Price</th>
                            <th className="px-4 py-3 text-center">Featured</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {loading && items.length === 0 ? (<tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>)
                            : items.length === 0 ? (<tr><td colSpan={7} className="text-center py-12 text-gray-400">No packages found</td></tr>)
                                : items.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-50 dark:bg-slate-800">
                                                {item.image ? (
                                                    <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300 dark:text-slate-600" /></div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-900 dark:text-gray-900 dark:text-white font-medium">{item.title}</p>
                                            <p className="text-gray-400 dark:text-slate-500 text-xs font-mono">/{item.slug}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-700 dark:text-slate-300">{item.duration}</td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-700 dark:text-slate-300 font-medium">NPR {item.price?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">{item.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mx-auto" />}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-500/20 text-gray-500 dark:text-slate-400'}`}>{item.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
