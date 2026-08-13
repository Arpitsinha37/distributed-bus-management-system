'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import {
    Plus, Pencil, Trash2, MapPin, Image as ImageIcon, Search, Eye,
    Upload, X, ChevronLeft, Globe, Camera, FileText
} from 'lucide-react';
import RichEditor from '@/components/RichEditor';

const EMPTY = {
    name: '', slug: '', subtitle: '', description: '', image: '', imageAlt: '',
    highlights: '', seoTitle: '', seoDescription: '', seoKeywords: '',
    displayOrder: '0', status: 'active'
};

type TabKey = 'details' | 'gallery' | 'seo';

export default function DestinationsPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [activeTab, setActiveTab] = useState<TabKey>('details');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const API_BASE = API_URL.replace('/api', '');
    const getImageUrl = (url: string) => { if (!url) return ''; return url.startsWith('data:') || url.startsWith('http') ? url : `${API_BASE}${url}`; };

    const load = async () => {
        setLoading(true);
        try {
            const r = await authFetch(`${API_URL}/admin/destinations`);
            const d = await r.json();
            setItems(Array.isArray(d) ? d : []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const save = async () => {
        setSaving(true);
        try {
            const highlights = form.highlights ? form.highlights.split('\n').map((f: string) => f.trim()).filter(Boolean) : [];
            const slug = form.slug || generateSlug(form.name);
            const payload = {
                name: form.name, slug, subtitle: form.subtitle, description: form.description,
                image: form.image, imageAlt: form.imageAlt, highlights,
                seoTitle: form.seoTitle, seoDescription: form.seoDescription, seoKeywords: form.seoKeywords,
                displayOrder: parseInt(form.displayOrder) || 0, status: form.status,
            };

            if (editing) {
                await authFetch(`${API_URL}/admin/destinations/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
            } else {
                await authFetch(`${API_URL}/admin/destinations`, { method: 'POST', body: JSON.stringify(payload) });
            }
            setEditMode(false); setEditing(null); setForm(EMPTY); load();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const del = async (id: string) => {
        if (!confirm('Delete this destination? This action cannot be undone.')) return;
        try {
            const res = await authFetch(`${API_URL}/admin/destinations/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); }
        load();
    };

    const edit = (item: any) => {
        setEditing(item);
        setForm({
            ...item,
            highlights: (item.highlights || []).join('\n'),
            displayOrder: String(item.displayOrder || 0),
        });
        setActiveTab('details');
        setEditMode(true);
    };

    const uploadImage = async (file: File) => {
        if (!editing?.id) {
            alert('Please save the destination first before uploading images.');
            return;
        }
        setUploading(true);
        try {
            const token = localStorage.getItem('cms_token');
            const fd = new FormData();
            fd.append('file', file);
            const r = await fetch(`${API_URL}/admin/destinations/${editing.id}/upload-image`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd,
            });
            const result = await r.json();
            if (result.url) {
                setForm((p: any) => ({ ...p, image: result.url }));
                setEditing((p: any) => ({ ...p, image: result.url }));
            }
        } catch (e) { console.error(e); alert('Upload failed'); }
        setUploading(false);
    };

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'details', label: 'Details', icon: FileText },
        { key: 'gallery', label: 'Images', icon: Camera },
        { key: 'seo', label: 'SEO', icon: Globe },
    ];

    // ═══════════════ EDIT MODE ═══════════════
    if (editMode) {
        return (
            <div className="min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setEditMode(false); setEditing(null); setForm(EMPTY); }}
                            className="flex items-center gap-1 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white text-sm transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Destinations
                        </button>
                        <span className="text-gray-300 dark:text-slate-600">/</span>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white">{editing ? 'Edit Destination' : 'New Destination'}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {editing && (
                            <a href={`https://www.newroadtravels.com/destinations/${form.slug}`} target="_blank" rel="noopener noreferrer"
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
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Info */}
                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                                <p className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Preferred Image Sizes
                                </p>
                                <p className="text-blue-600/70 dark:text-slate-400 text-xs mt-1">
                                    For Card Image: <span className="text-blue-700 dark:text-blue-300 font-mono">Aspect Ratio: 5/3 or 5/4</span><br />
                                    For Detail Page Banner: <span className="text-blue-700 dark:text-blue-300 font-mono">Aspect Ratio: 16/9</span>
                                </p>
                            </div>

                            {/* Title + Slug */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">TITLE *</label>
                                    <input value={form.name || ''} onChange={e => {
                                        const name = e.target.value;
                                        setForm((p: any) => ({ ...p, name, slug: editing ? p.slug : generateSlug(name) }));
                                    }} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                                        placeholder="Kathmandu Durbar Square" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SLUG *</label>
                                    <input value={form.slug || ''} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-900 dark:text-white/60 text-sm focus:outline-none focus:border-red-500 font-mono" />
                                </div>
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SUBTITLE</label>
                                <input value={form.subtitle || ''} onChange={e => setForm((p: any) => ({ ...p, subtitle: e.target.value }))}
                                    placeholder="UNESCO World Heritage Site"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                            </div>

                            {/* Order, Status */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">ORDER NO.</label>
                                    <input type="number" value={form.displayOrder || '0'} onChange={e => setForm((p: any) => ({ ...p, displayOrder: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">STATUS</label>
                                    <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">REGION</label>
                                    <input value="Nepal" disabled
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-900 dark:text-white/40 text-sm" />
                                </div>
                            </div>

                            {/* Highlights */}
                            <div>
                                <RichEditor value={form.highlights || ''} onChange={(val) => setForm((p: any) => ({ ...p, highlights: val }))} label="HIGHLIGHTS" placeholder="Ancient temples, Royal palaces, Street markets..." />
                            </div>

                            {/* Description */}
                            <div>
                                <RichEditor value={form.description || ''} onChange={(val) => setForm((p: any) => ({ ...p, description: val }))} label="DESCRIPTION" placeholder="Describe this destination in detail..." />
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-3">IMAGE (CARD & DETAIL PAGE)</label>
                                    <div className="flex items-center gap-3 mb-3">
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                            onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
                                        <button onClick={() => fileRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            {uploading ? 'Uploading...' : 'Choose File'}
                                        </button>
                                        <span className="text-gray-400 dark:text-slate-500 text-xs">PNG, JPG, WebP (max 5MB)</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-gray-400 dark:text-slate-500 text-xs">— or paste URL —</span>
                                    </div>
                                    <input value={form.image || ''} onChange={e => setForm((p: any) => ({ ...p, image: e.target.value }))}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 mb-3" />
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Alt Text:</label>
                                        <input value={form.imageAlt || ''} onChange={e => setForm((p: any) => ({ ...p, imageAlt: e.target.value }))}
                                            placeholder="Beautiful view of temples and palaces"
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    </div>
                                    {form.image && (
                                        <div className="mt-4 relative group">
                                            <img src={getImageUrl(form.image)}
                                                alt={form.imageAlt || 'Preview'}
                                                className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-white/10" />
                                            <button onClick={() => setForm((p: any) => ({ ...p, image: '' }))}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3 text-gray-900 dark:text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-3">PREVIEW</label>
                                    <div className="bg-gray-100 dark:bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                                        {form.image ? (
                                            <>
                                                <div className="h-40 overflow-hidden">
                                                    <img src={getImageUrl(form.image)}
                                                        alt="Card preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-gray-900 dark:text-gray-900 dark:text-white font-semibold text-sm">{form.name || 'Destination Name'}</h3>
                                                    <p className="text-gray-500 dark:text-slate-400 text-xs italic mt-1">{form.subtitle || 'Subtitle'}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-64 flex items-center justify-center text-gray-400 dark:text-slate-600">
                                                <div className="text-center">
                                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs">Upload an image to see preview</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 mb-4">
                                <p className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Search Engine Optimization
                                </p>
                                <p className="text-blue-600/70 dark:text-slate-400 text-xs mt-1">
                                    These fields help your destination page rank higher in Google and other search engines.
                                </p>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SEO TITLE</label>
                                <input value={form.seoTitle || ''} onChange={e => setForm((p: any) => ({ ...p, seoTitle: e.target.value }))}
                                    placeholder="Kathmandu Durbar Square — Nepal Heritage | New Road Travels"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                                <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{(form.seoTitle || '').length}/60 characters (recommended)</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SEO DESCRIPTION</label>
                                <textarea rows={3} value={form.seoDescription || ''} onChange={e => setForm((p: any) => ({ ...p, seoDescription: e.target.value }))}
                                    placeholder="Explore Kathmandu Durbar Square, a UNESCO World Heritage Site..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
                                <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">{(form.seoDescription || '').length}/160 characters (recommended)</p>
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SEO KEYWORDS</label>
                                <input value={form.seoKeywords || ''} onChange={e => setForm((p: any) => ({ ...p, seoKeywords: e.target.value }))}
                                    placeholder="kathmandu, durbar square, nepal heritage, UNESCO"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm font-medium mb-3">GOOGLE PREVIEW</label>
                                <div className="bg-white rounded-xl p-5 max-w-xl border border-gray-200">
                                    <p className="text-blue-700 text-lg font-medium leading-tight truncate">{form.seoTitle || form.name || 'Page Title'}</p>
                                    <p className="text-green-700 text-xs mt-1 truncate">www.newroadtravels.com/destinations/{form.slug || 'slug'}</p>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{form.seoDescription || form.description?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Page description...'}</p>
                                </div>
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-white">Destinations</h1>
                    <p className="text-gray-500 dark:text-slate-500 dark:text-slate-400 text-sm">Manage Nepal destinations shown in the rotating gallery on the Tours page</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setActiveTab('details'); setEditMode(true); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Destination
                </button>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent">
                        <tr className="text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Subtitle</th>
                            <th className="px-4 py-3 text-center">Order</th>
                            <th className="px-4 py-3 text-center">SEO</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-slate-400">Loading...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400 dark:text-slate-400">
                                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No destinations found. Add your first destination.</p>
                            </td></tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-50 dark:bg-slate-800 flex-shrink-0">
                                        {item.image ? (
                                            <img src={getImageUrl(item.image)}
                                                alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300 dark:text-slate-600" /></div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-gray-900 dark:text-gray-900 dark:text-white font-medium">{item.name}</p>
                                    <p className="text-gray-400 dark:text-slate-500 text-xs font-mono">/{item.slug}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs italic">{item.subtitle}</td>
                                <td className="px-4 py-3 text-center text-gray-500 dark:text-slate-400">{item.displayOrder}</td>
                                <td className="px-4 py-3 text-center">
                                    {item.seoTitle ? (
                                        <span className="text-green-600 dark:text-green-400 text-xs flex items-center justify-center gap-1"><Search className="w-3 h-3" /> ✓</span>
                                    ) : (
                                        <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1 justify-end">
                                        <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <a href={`https://www.newroadtravels.com/destinations/${item.slug}`} target="_blank" rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
