'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { Search, Link as LinkIcon, X, MapPin, Map, FileText, Car } from 'lucide-react';

interface InternalLinkPickerProps {
    onSelect: (url: string, text: string) => void;
    onClose: () => void;
}

export default function InternalLinkPicker({ onSelect, onClose }: InternalLinkPickerProps) {
    const { authFetch, API_URL } = useAuth();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    
    type Category = 'destinations' | 'tours' | 'blogs' | 'rentals';
    const [category, setCategory] = useState<Category>('destinations');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                let url = '';
                let pathPrefix = '';
                
                if (category === 'destinations') { url = `${API_URL}/admin/destinations`; pathPrefix = '/destinations'; }
                else if (category === 'tours') { url = `${API_URL}/tour-packages?search=${search}&status=`; pathPrefix = '/tours'; }
                else if (category === 'blogs') { url = `${API_URL}/blogs?search=${search}`; pathPrefix = '/blog'; }
                else if (category === 'rentals') { url = `${API_URL}/vehicle-rentals`; pathPrefix = '/rental'; }
                
                const res = await authFetch(url);
                const data = await res.json();
                
                let items = Array.isArray(data) ? data : data.data || [];
                
                if (search && (category === 'destinations' || category === 'rentals')) {
                    items = items.filter((i: any) => (i.name || i.title)?.toLowerCase().includes(search.toLowerCase()));
                }
                
                setResults(items.map((i: any) => ({
                    id: i.id,
                    title: i.title || i.name,
                    url: `${pathPrefix}/${i.slug}`,
                })));
            } catch (error) {
                console.error("Link picker error:", error);
            }
            setLoading(false);
        };
        const timeout = setTimeout(load, 300);
        return () => clearTimeout(timeout);
    }, [category, search, API_URL]);

    const tabs = [
        { id: 'destinations', label: 'Destinations', icon: MapPin },
        { id: 'tours', label: 'Tours', icon: Map },
        { id: 'blogs', label: 'Blogs', icon: FileText },
        { id: 'rentals', label: 'Rentals', icon: Car },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-red-500" /> Insert Internal Link
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search & Tabs */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-800/50">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search content to link..."
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-red-500 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setCategory(t.id as Category)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === t.id ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/10'}`}
                            >
                                <t.icon className="w-3.5 h-3.5" /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading content...</div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                            <LinkIcon className="w-8 h-8 mb-2 opacity-20" />
                            No matching {category} found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-1">
                            {results.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(item.url, item.title)}
                                    className="flex flex-col text-left px-4 py-3 mx-2 rounded-xl border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors group"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-red-600 dark:group-hover:text-red-400">{item.title}</span>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-mono truncate">{item.url}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
