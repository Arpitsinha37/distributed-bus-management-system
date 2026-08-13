'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon, PlusCircle } from 'lucide-react';
import RichEditor from '@/components/RichEditor';

const EMPTY = {
    vehicleName: '', slug: '', vehicleType: 'car', pricePerDay: '', capacity: '',
    transmission: 'automatic', fuelType: 'petrol', description: '', features: '',
    availabilityStatus: 'available', isFeatured: false, about: '', faqs: [],
    seoTitle: '', seoKeywords: '', seoDescription: ''
};

export default function VehicleRentalsPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const fileRef = useRef<HTMLInputElement>(null);

    const API_BASE = API_URL.replace('/api', '');
    const getImageUrl = (url: string) => { if (!url) return ''; return url.startsWith('data:') || url.startsWith('http') ? url : `${API_BASE}${url}`; };

    const load = async () => {
        setLoading(true);
        try {
            const r = await authFetch(`${API_URL}/vehicle-rentals?availabilityStatus=&limit=100`);
            const d = await r.json();
            setItems(Array.isArray(d) ? d : []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const save = async () => {
        const features = form.features ? form.features.split(',').map((f: string) => f.trim()).filter(Boolean) : [];
        const slug = form.slug || generateSlug(form.vehicleName);
        const faqs = form.faqs?.filter((f: any) => f.question && f.answer) || [];
        const payload = {
            ...form,
            slug,
            features,
            faqs,
            pricePerDay: parseFloat(form.pricePerDay) || 0,
            capacity: parseInt(form.capacity) || 0,
        };
        delete payload.images;
        delete payload.id;
        delete payload.createdAt;
        delete payload.updatedAt;

        if (editing) {
            await authFetch(`${API_URL}/vehicle-rentals/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await authFetch(`${API_URL}/vehicle-rentals`, { method: 'POST', body: JSON.stringify(payload) });
        }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };

    const del = async (id: string) => {
        if (!confirm('Delete this vehicle?')) return;
        try {
            const res = await authFetch(`${API_URL}/vehicle-rentals/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); }
        load();
    };

    const edit = (item: any) => {
        setEditing(item);
        setForm({
            ...EMPTY,
            ...item,
            pricePerDay: String(item.pricePerDay),
            capacity: String(item.capacity),
            features: (item.features || []).join(', '),
            faqs: item.faqs && Array.isArray(item.faqs) ? item.faqs : [],
        });
        setActiveTab('basic');
        setShowForm(true);
    };

    const uploadImage = async (id: string, file: File) => {
        setUploading(true);
        try {
            const token = localStorage.getItem('cms_token');
            const fd = new FormData();
            fd.append('file', file);
            await fetch(`${API_URL}/vehicle-rentals/${id}/upload-image`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: fd,
            });
            load();
        } catch (e) { console.error(e); }
        setUploading(false);
    };

    const removeImage = async (id: string, imageUrl: string) => {
        if (!confirm('Remove this image?')) return;
        try {
            const res = await authFetch(`${API_URL}/vehicle-rentals/${id}/remove-image`, {
                method: 'POST',
                body: JSON.stringify({ imageUrl }),
            });
            if (!res.ok) alert('Failed to remove image. Network error.');
        } catch(e) { console.error('Remove image error', e); alert('Failed to remove image.'); }
        load();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Rentals</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage rental vehicle listings with images</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Vehicle
                </button>
            </div>

            {/* Vehicle Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {loading && items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No vehicles found. Add your first vehicle rental.</p>
                    </div>
                ) : items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-colors">
                        {/* Image Section */}
                        <div className="relative h-40 bg-gray-50 dark:bg-slate-800 overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                                <img src={getImageUrl(item.images[0])} alt={item.vehicleName}
                                    className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-600">
                                    <ImageIcon className="w-10 h-10" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${item.availabilityStatus === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                    {item.availabilityStatus}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-gray-900 dark:text-white backdrop-blur-sm border border-white/20 capitalize">
                                    {item.vehicleType}
                                </span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{item.vehicleName}</h3>
                            <p className="text-slate-400 text-xs mb-2">/{item.slug || 'no-slug'}</p>
                            <div className="flex gap-3 text-xs text-slate-400 mb-3">
                                <span>NPR {item.pricePerDay}/day</span>
                                <span>{item.capacity} seats</span>
                                <span className="capitalize">{item.transmission}</span>
                            </div>

                            {/* Features */}
                            {item.features && item.features.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {item.features.slice(0, 4).map((f: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">{f}</span>
                                    ))}
                                    {item.features.length > 4 && (
                                        <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 rounded text-xs">+{item.features.length - 4}</span>
                                    )}
                                </div>
                            )}

                            {/* Images thumbnails */}
                            {item.images && item.images.length > 0 && (
                                <div className="flex gap-1 mb-3">
                                    {item.images.slice(0, 4).map((img: string, i: number) => (
                                        <div key={i} className="relative group/img w-10 h-10 rounded overflow-hidden border border-white/10">
                                            <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(item.id, img)}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                <X className="w-3 h-3 text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                    {item.images.length > 4 && (
                                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xs text-slate-400">+{item.images.length - 4}</div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button onClick={() => {
                                    const inp = document.createElement('input');
                                    inp.type = 'file'; inp.accept = 'image/*';
                                    inp.onchange = (e: any) => { if (e.target.files?.[0]) uploadImage(item.id, e.target.files[0]); };
                                    inp.click();
                                }} className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-white/10 rounded text-slate-400 hover:text-green-400 transition-colors">
                                    <Upload className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Add Image'}
                                </button>
                                <div className="ml-auto flex gap-1">
                                    <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-5 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Edit' : 'Add'} Vehicle Rental</h2>
                            <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-white/10 mb-6 shrink-0">
                            {[
                                { id: 'basic', label: 'Basic Info' },
                                { id: 'details', label: 'Details & FAQs' },
                                { id: 'seo', label: 'SEO' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-red-500 text-red-600 dark:text-red-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Form Content Scrolling Area */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

                            {/* BASIC INFO TAB */}
                            <div className={`space-y-4 ${activeTab === 'basic' ? 'block' : 'hidden'}`}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Vehicle Name *</label>
                                        <input value={form.vehicleName || ''} onChange={e => {
                                            const name = e.target.value;
                                            setForm((p: any) => ({ ...p, vehicleName: name, slug: generateSlug(name) }));
                                        }} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Slug</label>
                                        <input value={form.slug || ''} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white/60 text-sm focus:outline-none focus:border-red-500 font-mono" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Price per Day (NPR)</label>
                                        <input type="number" value={form.pricePerDay || ''} onChange={e => setForm((p: any) => ({ ...p, pricePerDay: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Capacity (seats)</label>
                                        <input type="number" value={form.capacity || ''} onChange={e => setForm((p: any) => ({ ...p, capacity: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Features (comma separated)</label>
                                    <input value={form.features || ''} onChange={e => setForm((p: any) => ({ ...p, features: e.target.value }))}
                                        placeholder="Luxury Seating, AC, WiFi, Mineral Water"
                                        className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                </div>

                                <div>
                                    <RichEditor value={form.description || ''} onChange={(val) => setForm((p: any) => ({ ...p, description: val }))} label="Short Description" placeholder="Brief description for the card..." />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        ['vehicleType', 'Vehicle Type', ['car', 'suv', 'van', 'bus', 'minibus', 'jeep']],
                                        ['transmission', 'Transmission', ['automatic', 'manual']],
                                        ['fuelType', 'Fuel Type', ['petrol', 'diesel', 'electric', 'hybrid']],
                                        ['availabilityStatus', 'Status', ['available', 'unavailable']]
                                    ].map(([k, l, opts]: any) => (
                                        <div key={k}>
                                            <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{l}</label>
                                            <select value={form[k]} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
                                                {opts.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <div className="col-span-full pt-4 mt-4 border-t border-gray-200 dark:border-white/10">
                                    <label className="flex items-center gap-2 cursor-pointer w-max">
                                        <input type="checkbox" checked={form.isFeatured || false} onChange={e => setForm((p: any) => ({ ...p, isFeatured: e.target.checked }))}
                                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500/30" />
                                        <span className="text-gray-700 dark:text-slate-300 text-sm font-medium">Feature on Homepage</span>
                                    </label>
                                </div>
                            </div>

                            {/* DETAILS & FAQS TAB */}
                            <div className={`space-y-6 ${activeTab === 'details' ? 'block' : 'hidden'}`}>
                                <div>
                                    <RichEditor value={form.about || ''} onChange={(val) => setForm((p: any) => ({ ...p, about: val }))} label="About this Vehicle" placeholder="Write a clear description of the vehicle, its history, comfort features, or best routes to take..." />
                                </div>

                                <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1 font-semibold">FAQs for this Vehicle</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const faqs = form.faqs || [];
                                                setForm({ ...form, faqs: [...faqs, { question: '', answer: '' }] });
                                            }}
                                            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                                        >
                                            <PlusCircle className="w-3 h-3" /> Add FAQ
                                        </button>
                                    </div>
                                    {(form.faqs || []).map((faq: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-white/10 mb-3 relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const faqs = [...form.faqs];
                                                    faqs.splice(idx, 1);
                                                    setForm({ ...form, faqs });
                                                }}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="mb-2">
                                                <input
                                                    placeholder="Question"
                                                    value={faq.question}
                                                    onChange={e => {
                                                        const faqs = [...form.faqs];
                                                        faqs[idx].question = e.target.value;
                                                        setForm({ ...form, faqs });
                                                    }}
                                                    className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 pr-8"
                                                />
                                            </div>
                                            <div>
                                                <textarea
                                                    rows={2}
                                                    placeholder="Answer"
                                                    value={faq.answer}
                                                    onChange={e => {
                                                        const faqs = [...form.faqs];
                                                        faqs[idx].answer = e.target.value;
                                                        setForm({ ...form, faqs });
                                                    }}
                                                    className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {(!form.faqs || form.faqs.length === 0) && (
                                        <div className="text-center py-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                                            <p className="text-sm text-slate-500">No FAQs added.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SEO TAB */}
                            <div className={`space-y-4 ${activeTab === 'seo' ? 'block' : 'hidden'}`}>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">SEO Title</label>
                                    <input value={form.seoTitle || ''} onChange={e => setForm((p: any) => ({ ...p, seoTitle: e.target.value }))}
                                        placeholder="Optimized title for search engines"
                                        className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">SEO Keywords</label>
                                    <input value={form.seoKeywords || ''} onChange={e => setForm((p: any) => ({ ...p, seoKeywords: e.target.value }))}
                                        placeholder="rent jeep, kathmandu car rental (comma separated)"
                                        className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">SEO Description</label>
                                    <textarea rows={3} value={form.seoDescription || ''} onChange={e => setForm((p: any) => ({ ...p, seoDescription: e.target.value }))}
                                        placeholder="Meta description for search results"
                                        className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 resize-none" />
                                </div>
                            </div>

                        </div> {/* end scroll area */}

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-white/10 shrink-0">
                            <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }}
                                className="flex-1 px-4 py-2 border border-white/10 text-gray-700 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={save}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white dark:text-white rounded-lg text-sm font-medium transition-colors">Save Vehicle Rental</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
