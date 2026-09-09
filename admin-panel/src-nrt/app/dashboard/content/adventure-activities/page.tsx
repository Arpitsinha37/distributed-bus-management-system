'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useDebounce } from '@/lib/useDebounce';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, ChevronLeft, Upload, X, Camera, Globe, Image as ImageIcon, MapPin, Clock } from 'lucide-react';
import RichEditor from '@/components/RichEditor';

const EMPTY = { 
    name: '', slug: '', description: '', content: '', image: '', 
    price: '', duration: '', detailsTable: [], displayOrder: 0, status: 'active' 
};

type TabKey = 'activity' | 'content' | 'details' | 'image';

export default function AdventureActivitiesPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [activeTab, setActiveTab] = useState<TabKey>('activity');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const API_BASE = API_URL.replace('/api', '');
    const getImageUrl = (url: string) => { if (!url) return ''; return url.startsWith('data:') || url.startsWith('http') ? url : `${API_BASE}${url}`; };

    const load = async () => { 
        setLoading(true); 
        try {
            const r = await authFetch(`${API_URL}/adventure-activities?search=${debouncedSearch}`); 
            const d = await r.json(); 
            setItems(Array.isArray(d) ? d : []); 
        } catch (e) { console.error(e); }
        setLoading(false); 
    };

    useEffect(() => { load(); }, [debouncedSearch]);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const save = async () => {
        setSaving(true);
        try {
            const slug = form.slug || generateSlug(form.name);
            const payload = { ...form, slug, displayOrder: parseInt(form.displayOrder) || 0, detailsTable: Array.isArray(form.detailsTable) ? form.detailsTable : [] };
            delete payload.id; delete payload.createdAt; delete payload.updatedAt;
            if (editing) { 
                await authFetch(`${API_URL}/adventure-activities/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); 
            } else { 
                await authFetch(`${API_URL}/adventure-activities`, { method: 'POST', body: JSON.stringify(payload) }); 
            }
            setEditMode(false); setEditing(null); setForm(EMPTY); load();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const del = async (id: string) => { 
        if (!confirm('Delete?')) return; 
        try {
            const res = await authFetch(`${API_URL}/adventure-activities/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); } 
        load(); 
    };

    const toggle = async (item: any) => { 
        await authFetch(`${API_URL}/adventure-activities/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'active' ? 'inactive' : 'active' }) }); 
        load(); 
    };

    const edit = (item: any) => { 
        setEditing(item); 
        setForm({ ...EMPTY, ...item, detailsTable: Array.isArray(item.detailsTable) ? item.detailsTable : [] }); 
        setActiveTab('activity');
        setEditMode(true); 
    };

    const tabs: { key: TabKey; label: string; icon: any }[] = [
        { key: 'activity', label: 'Activity Basics', icon: MapPin },
        { key: 'content', label: 'Rich Content', icon: Globe },
        { key: 'details', label: 'Details Table', icon: Clock },
        { key: 'image', label: 'Image', icon: Camera },
    ];

    if (editMode) {
        return (
            <div className="min-h-screen">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setEditMode(false); setEditing(null); setForm(EMPTY); }} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white text-sm transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Activities
                        </button>
                        <span className="text-gray-300 dark:text-slate-600">/</span>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Activity' : 'New Activity'}</h1>
                    </div>
                    <button onClick={save} disabled={saving} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Activity'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-white/5 rounded-lg p-1 w-fit">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                    {activeTab === 'activity' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">NAME *</label>
                                    <input value={form.name || ''} onChange={e => {
                                        const name = e.target.value;
                                        setForm((p: any) => ({ ...p, name, slug: editing ? p.slug : generateSlug(name) }));
                                    }} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" placeholder="Paragliding" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SLUG *</label>
                                    <input value={form.slug || ''} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-500 dark:text-white/60 text-sm focus:outline-none focus:border-red-500 font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">PRICE</label>
                                    <input value={form.price || ''} onChange={e => setForm((p: any) => ({ ...p, price: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" placeholder="e.g. NPR 8500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">DURATION</label>
                                    <input value={form.duration || ''} onChange={e => setForm((p: any) => ({ ...p, duration: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" placeholder="e.g. 30 Minutes" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">DISPLAY ORDER</label>
                                    <input type="number" value={form.displayOrder || 0} onChange={e => setForm((p: any) => ({ ...p, displayOrder: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">STATUS</label>
                                    <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">SHORT DESCRIPTION</label>
                                <textarea rows={3} value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 resize-none" placeholder="A brief snippet about this activity..." />
                            </div>
                            <div>
                                <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">FULL CONTENT</label>
                                <div className="border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden">
                                    <RichEditor value={form.content || ''} onChange={(val) => setForm((p: any) => ({ ...p, content: val }))} label="" placeholder="Detailed write-up of the activity..." />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4">
                                <div>
                                    <h3 className="text-blue-800 dark:text-blue-300 font-bold text-sm mb-1">Details Table</h3>
                                    <p className="text-blue-600 dark:text-blue-400 text-xs">Add key-value pairs (e.g. Difficulty: Easy, Location: Pokhara)</p>
                                </div>
                                <button type="button" onClick={() => {
                                    setForm((p: any) => ({
                                        ...p,
                                        detailsTable: [...(p.detailsTable || []), { id: Date.now().toString(), key: '', value: '' }]
                                    }));
                                }} className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" /> Add Row
                                </button>
                            </div>
                            
                            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-700 dark:text-white dark:bg-white/5 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 w-1/3">Label (Key)</th>
                                            <th className="px-4 py-3 w-1/2">Description (Value)</th>
                                            <th className="px-4 py-3 w-20 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {(!form.detailsTable || form.detailsTable.length === 0) ? (
                                            <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">No details added yet.</td></tr>
                                        ) : (
                                            form.detailsTable.map((row: any, idx: number) => (
                                                <tr key={row.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-4 py-3 align-top">
                                                        <input type="text" value={row.key} onChange={(e) => {
                                                            const newRows = [...form.detailsTable];
                                                            newRows[idx].key = e.target.value;
                                                            setForm((p: any) => ({ ...p, detailsTable: newRows }));
                                                        }} placeholder="e.g. Inclusions" className="w-full px-3 py-1.5 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-red-500 focus:outline-none transition-colors" />
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <textarea rows={2} value={row.value} onChange={(e) => {
                                                            const newRows = [...form.detailsTable];
                                                            newRows[idx].value = e.target.value;
                                                            setForm((p: any) => ({ ...p, detailsTable: newRows }));
                                                        }} placeholder="e.g. Transport, Guide" className="w-full px-3 py-1.5 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-red-500 focus:outline-none resize-none transition-colors" />
                                                    </td>
                                                    <td className="px-4 py-3 align-top text-center">
                                                        <button type="button" onClick={() => {
                                                            setForm((p: any) => ({ ...p, detailsTable: p.detailsTable.filter((_: any, i: number) => i !== idx) }));
                                                        }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors mt-1">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'image' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider mb-4">Header Image</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <label className="block text-gray-500 dark:text-slate-400 text-xs mb-1">Image URL</label>
                                            <input value={form.image || ''} onChange={e => setForm((p: any) => ({ ...p, image: e.target.value }))} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 dark:text-slate-400 text-xs mb-2">IMAGE PREVIEW</label>
                                        <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                                            {form.image ? (
                                                <div className="h-48 overflow-hidden"><img src={getImageUrl(form.image)} alt="" className="w-full h-full object-cover" /></div>
                                            ) : (
                                                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-slate-600">
                                                    <div className="text-center"><ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-xs">Add an image URL</p></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Adventure Activities</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage the dynamic list of adventure activities.</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setEditMode(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <Plus className="w-4 h-4" /> Create
                </button>
            </div>
            
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500" />
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-white/10">
                        <tr className="text-slate-600 dark:text-slate-400">
                            <th className="px-4 py-3 text-left">Activity Name</th>
                            <th className="px-4 py-3 text-left">Price</th>
                            <th className="px-4 py-3 text-left">Order</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {loading ? 
                            <tr><td colSpan={5} className="text-center py-12 text-slate-400">Loading...</td></tr> 
                        : items.length === 0 ? 
                            <tr><td colSpan={5} className="text-center py-12 text-slate-400">No Adventure Activities</td></tr> 
                        : items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.name}</td>
                                <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{item.price || '—'}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.displayOrder}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggle(item)} className="flex items-center gap-1 text-xs">
                                        {item.status === 'active' ? 
                                            <><ToggleRight className="w-5 h-5 text-green-400" /><span className="text-green-400">Active</span></> 
                                        : 
                                            <><ToggleLeft className="w-5 h-5 text-slate-400" /><span className="text-slate-600 dark:text-slate-400">Inactive</span></>
                                        }
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
