'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Plus, Pencil, Trash2, Search, FileText, X } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

interface Blog {
    id: string; title: string; slug: string; excerpt: string; content: string; coverImage: string; author: string; isPublished: boolean; createdAt: string;
}

export default function BlogsPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Blog | null>(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: '', isPublished: true });

    const fetchAll = async () => {
        try { const res = await apiGet<Blog[]>('/cms/blogs', accessToken!); setData(res || []); } catch {} setLoading(false);
    };
    useEffect(() => { fetchAll(); }, [accessToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) await apiPatch(`/cms/blogs/${editing.id}`, form, accessToken!);
            else await apiPost('/cms/blogs', form, accessToken!);
            setShowModal(false); setEditing(null); fetchAll();
        } catch (err: any) { alert(err.message); }
    };
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this blog?')) return;
        await apiDelete(`/cms/blogs/${id}`, accessToken!); fetchAll();
    };

    const filtered = data.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-green-500" /> Blogs & News
                    </h1>
                </div>
                <button onClick={() => { setEditing(null); setForm({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: '', isPublished: true }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm">
                    <Plus className="w-4 h-4" /> Add Post
                </button>
            </div>
            
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search blogs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none" />
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                        <tr><th className="text-left px-5 py-3 font-medium">Post</th><th className="text-left px-5 py-3 font-medium">Author</th><th className="text-left px-5 py-3 font-medium">Status</th><th className="text-left px-5 py-3 font-medium">Date</th><th className="text-right px-5 py-3 font-medium">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No blogs found</td></tr> : filtered.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-5 py-3.5">
                                    <p className="font-medium text-gray-900 dark:text-white">{r.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{r.slug}</p>
                                </td>
                                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{r.author || '-'}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.isPublished ? 'Published' : 'Draft'}</span>
                                </td>
                                <td className="px-5 py-3.5 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-3.5 text-right space-x-2">
                                    <button onClick={() => { setEditing(r); setForm({ ...r, excerpt: r.excerpt||'', coverImage: r.coverImage||'', author: r.author||'' }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-500"><Pencil className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[95vh]">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800"><h2 className="text-lg font-bold">{editing ? 'Edit Blog' : 'Add Blog'}</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                <div><label className="block text-sm mb-1">Slug</label><input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
                                <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm mb-1">Author</label><input type="text" value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                <div><label className="block text-sm mb-1">Status</label><select value={form.isPublished ? '1':'0'} onChange={e => setForm({...form, isPublished: e.target.value === '1'})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none"><option value="1">Published</option><option value="0">Draft</option></select></div>
                            </div>
                            <div><label className="block text-sm mb-1">Excerpt</label><textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                            <div><label className="block text-sm mb-1">Content (Markdown/HTML)</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows={8} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none font-mono text-sm" /></div>
                            <button type="submit" className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg">{editing ? 'Update' : 'Create'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
