'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Plus, Pencil, Trash2, Film, Image as ImageIcon, X } from 'lucide-react';

const EMPTY = {
    name: '', avatar: '', mediaItems: [] as any[], displayOrder: '0', status: 'active'
};

export default function StoriesPage() {
    const { authFetch, API_URL } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState<any>(EMPTY);
    const [newMediaUrl, setNewMediaUrl] = useState('');
    const [newMediaType, setNewMediaType] = useState('image');

    const load = async () => {
        setLoading(true);
        try {
            const r = await authFetch(`${API_URL}/admin/stories`);
            const d = await r.json();
            setItems(Array.isArray(d) ? d : []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const save = async () => {
        const payload = {
            name: form.name,
            avatar: form.avatar,
            mediaItems: form.mediaItems || [],
            displayOrder: parseInt(form.displayOrder) || 0,
            status: form.status,
        };

        if (editing) {
            await authFetch(`${API_URL}/admin/stories/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await authFetch(`${API_URL}/admin/stories`, { method: 'POST', body: JSON.stringify(payload) });
        }
        setShowForm(false); setEditing(null); setForm(EMPTY); load();
    };

    const del = async (id: string) => {
        if (!confirm('Delete this story?')) return;
        try {
            const res = await authFetch(`${API_URL}/admin/stories/${id}/delete`, { method: 'POST' });
            if (!res.ok) alert('Failed to delete. Network error.');
        } catch(e) { console.error('Delete error', e); alert('Failed to delete.'); }
        load();
    };

    const edit = (item: any) => {
        setEditing(item);
        setForm({
            ...item,
            mediaItems: item.mediaItems || [],
            displayOrder: String(item.displayOrder || 0),
        });
        setShowForm(true);
    };

    const addMedia = () => {
        if (!newMediaUrl.trim()) return;
        setForm((p: any) => ({
            ...p,
            mediaItems: [...(p.mediaItems || []), { type: newMediaType, src: newMediaUrl.trim() }]
        }));
        setNewMediaUrl('');
    };

    const removeMedia = (index: number) => {
        setForm((p: any) => ({
            ...p,
            mediaItems: p.mediaItems.filter((_: any, i: number) => i !== index)
        }));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-white">Stories</h1>
                    <p className="text-gray-500 dark:text-slate-500 dark:text-slate-400 text-sm">Manage Instagram-style story circles on the Tours page</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Add Story
                </button>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-400 dark:text-slate-400">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400 dark:text-slate-400">
                        <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No stories found. Create your first story.</p>
                    </div>
                ) : items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden group hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                        {/* Avatar + Name */}
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500 flex-shrink-0">
                                {item.avatar ? (
                                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 text-lg font-bold">
                                        {item.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-gray-900 dark:text-gray-900 dark:text-white font-semibold truncate">{item.name}</h3>
                                <p className="text-gray-500 dark:text-slate-400 text-xs">
                                    {(item.mediaItems || []).length} media item{(item.mediaItems || []).length !== 1 ? 's' : ''}
                                </p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'}`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        {/* Media thumbnails */}
                        {item.mediaItems && item.mediaItems.length > 0 && (
                            <div className="px-4 pb-2 flex gap-1 overflow-x-auto">
                                {item.mediaItems.slice(0, 4).map((m: any, i: number) => (
                                    <div key={i} className="w-10 h-10 rounded flex-shrink-0 overflow-hidden border border-gray-200 dark:border-white/10">
                                        {m.type === 'video' ? (
                                            <div className="w-full h-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <Film className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                                            </div>
                                        ) : (
                                            <img src={m.src || m.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                                {item.mediaItems.length > 4 && (
                                    <div className="w-10 h-10 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs text-gray-500 dark:text-slate-400 flex-shrink-0">
                                        +{item.mediaItems.length - 4}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="px-4 pb-3 pt-2 flex items-center gap-2 border-t border-gray-100 dark:border-white/5 mt-2">
                            <span className="text-xs text-gray-400 dark:text-slate-500">Order: #{item.displayOrder}</span>
                            <div className="ml-auto flex gap-1">
                                <button onClick={() => edit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => del(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-900 dark:text-white mb-5">{editing ? 'Edit' : 'Add'} Story</h2>
                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm mb-1">Story Name *</label>
                                <input value={form.name || ''} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))}
                                    placeholder="Nepal Travel, Kathmandu, etc."
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                            </div>

                            {/* Avatar */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm mb-1">Avatar Image URL</label>
                                <input value={form.avatar || ''} onChange={e => setForm((p: any) => ({ ...p, avatar: e.target.value }))}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                            </div>

                            {/* Avatar Preview */}
                            {form.avatar && (
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500">
                                        <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                            {/* Media Items */}
                            <div>
                                <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm mb-2">Media Items (images & videos shown in the story)</label>

                                {form.mediaItems && form.mediaItems.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {form.mediaItems.map((m: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-2 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-xs ${m.type === 'video' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                                                    {m.type}
                                                </span>
                                                <span className="flex-1 text-gray-500 dark:text-gray-900 dark:text-white/70 truncate text-xs font-mono">{m.src || m.url}</span>
                                                <button onClick={() => removeMedia(i)} className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add new media */}
                                <div className="flex gap-2">
                                    <select value={newMediaType} onChange={e => setNewMediaType(e.target.value)}
                                        className="px-3 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm w-24">
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                    <input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)}
                                        placeholder="Paste image or video URL..."
                                        onKeyDown={e => e.key === 'Enter' && addMedia()}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                    <button onClick={addMedia}
                                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors">
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Display Order + Status */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm mb-1">Display Order</label>
                                    <input type="number" value={form.displayOrder || '0'} onChange={e => setForm((p: any) => ({ ...p, displayOrder: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 dark:text-gray-700 dark:text-slate-300 text-sm mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-700 dark:text-slate-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button onClick={save}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white dark:text-white rounded-lg text-sm font-medium transition-colors">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
