'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/useDebounce';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import RichEditor from '@/components/RichEditor';

const EMPTY = {
    title: '', source: '', destination: '', price: '', busType: 'standard',
    departureTime: '', arrivalTime: '', duration: '', status: 'active',
    image: '', description: '', amenities: [], gallery: [], metaTitle: '', metaDescription: '', faqs: []
};

export default function BusServicesPage() {
    const { authFetch, API_URL, token } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [amenityInput, setAmenityInput] = useState('');
    const [faqInput, setFaqInput] = useState({ question: '', answer: '' });
    
    const debouncedSearch = useDebounce(search, 500);

    const handleAddFaq = () => {
        if (!faqInput.question.trim() || !faqInput.answer.trim()) return;
        setForm((p: any) => ({ ...p, faqs: [...(p.faqs || []), faqInput] }));
        setFaqInput({ question: '', answer: '' });
    };

    const handleRemoveFaq = (index: number) => {
        setForm((p: any) => ({ ...p, faqs: p.faqs.filter((_: any, i: number) => i !== index) }));
    };

    const load = async () => {
        setLoading(true);
        const r = await authFetch(`${API_URL}/bus-services?status=all&search=${debouncedSearch}&limit=100`);
        const d = await r.json(); setItems(Array.isArray(d) ? d : []); setLoading(false);
    };
    useEffect(() => { load(); }, [debouncedSearch]);

    const handleAddAmenity = () => {
        if (!amenityInput.trim()) return;
        setForm((p: any) => ({ ...p, amenities: [...(p.amenities || []), amenityInput.trim()] }));
        setAmenityInput('');
    };

    const handleRemoveAmenity = (index: number) => {
        setForm((p: any) => ({ ...p, amenities: p.amenities.filter((_: any, i: number) => i !== index) }));
    };

    const save = async () => {
        const payload = { ...form, price: parseFloat(form.price) };
        delete payload.id; delete payload.createdAt; delete payload.updatedAt;
        if (editing) { await authFetch(`${API_URL}/bus-services/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
        else { await authFetch(`${API_URL}/bus-services`, { method: 'POST', body: JSON.stringify(payload) }); }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };

    const del = async (id: string) => {
        if (!confirm('Delete?')) return;
        try {
            const res = await authFetch(`${API_URL}/bus-services/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch (e) { console.error('Delete error', e); alert('Failed to delete.'); }
        load();
    };

    const toggle = async (item: any) => {
        await authFetch(`${API_URL}/bus-services/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: item.status === 'active' ? 'inactive' : 'active' }) });
        load();
    };

    const edit = (item: any) => {
        setEditing(item);
        setForm({ ...EMPTY, ...item, price: String(item.price) });
        setShowForm(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bus Services</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage daily bus routes shown on the homepage</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Service
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, source, destination..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-red-500" />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-white/10">
                        <tr className="text-slate-600 dark:text-slate-400">
                            <th className="px-4 py-3 text-left">Route</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Price</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {loading && items.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-slate-400">Loading...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-slate-400">No services found</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.source} → {item.destination}</td>
                                <td className="px-4 py-3 text-gray-700 dark:text-slate-300 capitalize">{item.busType}</td>
                                <td className="px-4 py-3 text-gray-700 dark:text-slate-300">NPR {item.price}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggle(item)} className="flex items-center gap-1 text-xs">
                                        {item.status === 'active' ? <><ToggleRight className="w-5 h-5 text-green-400" /><span className="text-green-400">Active</span></> : <><ToggleLeft className="w-5 h-5 text-slate-400" /><span className="text-slate-600 dark:text-slate-400">Inactive</span></>}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 justify-end">
                                        <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-white/10 pb-4">{editing ? 'Edit' : 'Add'} Bus Service</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Left Column - Core Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-md border-b border-gray-100 dark:border-white/10 pb-2">Core Details</h3>
                                {[['title', 'Title'], ['source', 'Source City'], ['destination', 'Destination City'], ['departureTime', 'Departure Time'], ['arrivalTime', 'Arrival Time'], ['duration', 'Duration (e.g. 5h 30m)'], ['price', 'Price (NPR)']].map(([k, l]) => (
                                    <div key={k}>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">{l}</label>
                                        <input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Bus Type</label>
                                    <select value={form.busType} onChange={e => setForm((p: any) => ({ ...p, busType: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
                                        {['standard', 'deluxe', 'sofa', 'sleeper', 'volvo'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
                                        <option value="active">Active</option><option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column - Rich Content */}
                            <div className="space-y-5">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-md border-b border-gray-100 dark:border-white/10 pb-2">Rich Content & SEO</h3>

                                    <RichEditor editorKey={editing ? editing.id : 'new'} value={form.description || ''} onChange={(val) => setForm((p: any) => ({ ...p, description: val }))} label="Description" placeholder="Detailed description of the bus service..." />

                                <div>
                                    <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Amenities</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={amenityInput}
                                            onChange={e => setAmenityInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
                                            placeholder="e.g. WiFi, AC, Water Bottle..."
                                            className="flex-1 px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500"
                                        />
                                        <button onClick={handleAddAmenity} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-lg text-sm font-medium transition-colors">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(form.amenities || []).map((amenity: string, index: number) => (
                                            <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                {amenity}
                                                <button onClick={() => handleRemoveAmenity(index)} className="hover:text-red-900 dark:hover:text-red-200"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h4>
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                                        <div className="space-y-3 mb-3">
                                            <input
                                                value={faqInput.question}
                                                onChange={e => setFaqInput(p => ({ ...p, question: e.target.value }))}
                                                placeholder="Question (e.g. What is the luggage policy?)"
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
                                            />
                                            <textarea
                                                rows={2}
                                                value={faqInput.answer}
                                                onChange={e => setFaqInput(p => ({ ...p, answer: e.target.value }))}
                                                placeholder="Answer..."
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                                            />
                                            <button onClick={handleAddFaq} className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium rounded-lg text-sm transition-colors border border-blue-200 dark:border-blue-800">
                                                + Add FAQ
                                            </button>
                                        </div>

                                        <div className="space-y-2 mt-4">
                                            {(form.faqs || []).map((faq: any, index: number) => (
                                                <div key={index} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-white/10 relative group">
                                                    <button onClick={() => handleRemoveFaq(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white pr-6 mb-1">Q: {faq.question}</p>
                                                    <p className="text-xs text-gray-600 dark:text-slate-400">A: {faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-white/10">
                                    <ImageUpload
                                        value={form.image || ''}
                                        onChange={(url) => setForm((p: any) => ({ ...p, image: url }))}
                                        label="Main Cover Image"
                                        apiUrl={API_URL}
                                        token={token}
                                        previewClass="h-40 w-full object-cover rounded-lg"
                                    />
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">Photo Gallery (Secondary Images)</label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            {[0, 1, 2, 3].map(index => (
                                                <ImageUpload
                                                    key={index}
                                                    value={(form.gallery || [])[index] || ''}
                                                    onChange={(url) => {
                                                        const newGallery = [...(form.gallery || [])];
                                                        newGallery[index] = url;
                                                        setForm((p: any) => ({ ...p, gallery: newGallery.filter(Boolean) }));
                                                    }}
                                                    label={`Photo ${index + 1}`}
                                                    apiUrl={API_URL}
                                                    token={token}
                                                    previewClass="h-24 w-full object-cover rounded-lg"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">SEO Settings</h4>
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Meta Title</label>
                                        <input value={form.metaTitle || ''} onChange={e => setForm((p: any) => ({ ...p, metaTitle: e.target.value }))} placeholder="SEO Page Title" className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-slate-300 text-sm mb-1">Meta Description</label>
                                        <textarea rows={2} value={form.metaDescription || ''} onChange={e => setForm((p: any) => ({ ...p, metaDescription: e.target.value }))} placeholder="SEO Description..." className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 resize-none" />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-white/10">
                            <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }} className="flex-1 px-4 py-3 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={save} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 rounded-lg text-sm font-bold transition-all transform hover:-translate-y-0.5">Save Bus Service</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
