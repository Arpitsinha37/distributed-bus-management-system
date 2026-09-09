'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import {
    Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight,
    Trash2, Mail, Tag, Users, TrendingUp, Flame, Zap, Snowflake,
    Eye, MousePointerClick, Target, MapPin, Clock, Plus, Download,
    MoreVertical, CheckSquare, Square, RefreshCw, Sparkles,
    Activity, UserPlus, ArrowUpRight, BarChart3, Send
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
interface SubscriberTag { id: string; category: string; value: string; }
interface SubscriberEvent { id: string; eventType: string; eventData: any; campaignId?: string; createdAt: string; }
interface Subscriber {
    id: string; email: string; name?: string; phone?: string; city?: string;
    budgetTier?: string; leadScore: number; source?: string; status: string;
    subscribedAt: string; updatedAt: string; tags: SubscriberTag[];
    _count?: { events: number };
}
interface Stats {
    total: number; active: number; hotLeads: number; warmLeads: number;
    coldLeads: number; dormant: number;
    topCities: { city: string; _count: number }[];
    topSources: { source: string; _count: number }[];
}

const TAG_CATEGORIES = [
    { key: 'destination', label: 'Destination', color: 'emerald', options: ['Pokhara', 'Chitwan', 'Lumbini', 'Kathmandu', 'Nagarkot', 'Mustang', 'Everest Region', 'Annapurna', 'Langtang', 'Rara'] },
    { key: 'travel_type', label: 'Travel Type', color: 'blue', options: ['Adventure', 'Cultural', 'Pilgrimage', 'Relaxation', 'Photography', 'Wildlife'] },
    { key: 'tour_style', label: 'Tour Style', color: 'violet', options: ['Solo', 'Couple/Honeymoon', 'Family', 'Group', 'Corporate'] },
    { key: 'budget', label: 'Budget', color: 'amber', options: ['Budget', 'Mid-Range', 'Premium', 'Luxury'] },
    { key: 'activity', label: 'Activity', color: 'rose', options: ['Trekking', 'Paragliding', 'Rafting', 'Jungle Safari', 'Bungee', 'Cycling', 'Yoga Retreat'] },
    { key: 'season', label: 'Season', color: 'cyan', options: ['Spring Trekker', 'Monsoon Adventurer', 'Autumn Explorer', 'Winter Escaper'] },
];

const TAG_COLORS: Record<string, string> = {
    destination: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    travel_type: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    tour_style: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
    budget: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    activity: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
    season: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
};

function getScoreInfo(score: number) {
    if (score >= 70) return { label: 'Hot', icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', ring: 'ring-red-500/30' };
    if (score >= 40) return { label: 'Warm', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', ring: 'ring-amber-500/30' };
    if (score >= 10) return { label: 'Cold', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'ring-blue-500/30' };
    return { label: 'Dormant', icon: Zap, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', ring: 'ring-slate-400/30' };
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function EmailSubscribersPage() {
    const { authFetch, API_URL } = useAuth();

    // Data
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterBudget, setFilterBudget] = useState('');
    const [filterTag, setFilterTag] = useState('');
    const [sortBy, setSortBy] = useState('subscribedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);

    // Selection
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Profile drawer
    const [profileId, setProfileId] = useState<string | null>(null);
    const [profile, setProfile] = useState<(Subscriber & { events: SubscriberEvent[] }) | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Tag modal
    const [showTagModal, setShowTagModal] = useState(false);
    const [tagTargets, setTagTargets] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<{ category: string; value: string }[]>([]);

    // Edit modal
    const [editSub, setEditSub] = useState<Subscriber | null>(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', city: '', budgetTier: '' });

    // Cities for filter
    const [cities, setCities] = useState<string[]>([]);

    // ── Debounce search ──
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // ── Fetch subscribers ──
    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '25');
            params.set('sortBy', sortBy);
            params.set('sortOrder', sortOrder);
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (filterCity) params.set('city', filterCity);
            if (filterStatus) params.set('status', filterStatus);
            if (filterBudget) params.set('budgetTier', filterBudget);
            if (filterTag) params.set('tag', filterTag);

            const res = await authFetch(`${API_URL}/email-subscribers?${params.toString()}`);
            const json = await res.json();
            setSubscribers(json.data || []);
            setTotal(json.meta?.total || 0);
            setTotalPages(json.meta?.totalPages || 1);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [page, debouncedSearch, filterCity, filterStatus, filterBudget, filterTag, sortBy, sortOrder]);

    // ── Fetch stats ──
    const fetchStats = useCallback(async () => {
        try {
            const res = await authFetch(`${API_URL}/email-subscribers/stats`);
            setStats(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    // ── Fetch cities ──
    const fetchCities = useCallback(async () => {
        try {
            const res = await authFetch(`${API_URL}/email-subscribers/cities`);
            setCities(await res.json());
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);
    useEffect(() => { fetchStats(); fetchCities(); }, []);

    // ── Fetch profile ──
    useEffect(() => {
        if (!profileId) { setProfile(null); return; }
        setProfileLoading(true);
        authFetch(`${API_URL}/email-subscribers/${profileId}`)
            .then(r => r.json())
            .then(d => { setProfile(d); setProfileLoading(false); })
            .catch(() => setProfileLoading(false));
    }, [profileId]);

    // ── Actions ──
    const handleDelete = async (id: string) => {
        if (!confirm('Remove this subscriber?')) return;
        try {
            await authFetch(`${API_URL}/email-subscribers/${id}`, { method: 'DELETE' });
            fetchSubscribers(); fetchStats();
        } catch (e) { console.error(e); }
    };

    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!confirm(`Delete ${selected.size} subscribers?`)) return;
        try {
            await authFetch(`${API_URL}/email-subscribers/bulk/delete`, {
                method: 'POST', body: JSON.stringify({ ids: [...selected] }),
            });
            setSelected(new Set()); fetchSubscribers(); fetchStats();
        } catch (e) { console.error(e); }
    };

    const handleBulkTag = async () => {
        if (selectedTags.length === 0) return;
        try {
            await authFetch(`${API_URL}/email-subscribers/bulk/tag`, {
                method: 'POST', body: JSON.stringify({ ids: tagTargets, tags: selectedTags }),
            });
            setShowTagModal(false); setSelectedTags([]); setTagTargets([]);
            fetchSubscribers();
        } catch (e) { console.error(e); }
    };

    const handleUpdateSub = async () => {
        if (!editSub) return;
        try {
            await authFetch(`${API_URL}/email-subscribers/${editSub.id}`, {
                method: 'PUT', body: JSON.stringify(editForm),
            });
            setEditSub(null); fetchSubscribers();
        } catch (e) { console.error(e); }
    };

    const handleRemoveTag = async (tagId: string) => {
        try {
            await authFetch(`${API_URL}/email-subscribers/tags/${tagId}`, { method: 'DELETE' });
            if (profileId) {
                const res = await authFetch(`${API_URL}/email-subscribers/${profileId}`);
                setProfile(await res.json());
            }
            fetchSubscribers();
        } catch (e) { console.error(e); }
    };

    const toggleSelect = (id: string) => {
        const s = new Set(selected);
        if (s.has(id)) s.delete(id); else s.add(id);
        setSelected(s);
    };
    const toggleSelectAll = () => {
        if (selected.size === subscribers.length) setSelected(new Set());
        else setSelected(new Set(subscribers.map(s => s.id)));
    };

    const activeFilterCount = [filterCity, filterStatus, filterBudget, filterTag].filter(Boolean).length;

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════
    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        Travel Marketing Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage subscribers, track engagement, and drive bookings</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { fetchSubscribers(); fetchStats(); }} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <StatCard icon={Users} label="Total" value={stats.total} color="indigo" />
                    <StatCard icon={Zap} label="Active" value={stats.active} color="emerald" />
                    <StatCard icon={Flame} label="Hot Leads" value={stats.hotLeads} color="red" sub="Score ≥ 70" />
                    <StatCard icon={TrendingUp} label="Warm Leads" value={stats.warmLeads} color="amber" sub="Score 40–69" />
                    <StatCard icon={Snowflake} label="Cold" value={stats.coldLeads} color="blue" sub="Score 10–39" />
                    <StatCard icon={Activity} label="Dormant" value={stats.dormant} color="slate" sub="Score < 10" />
                </div>
            )}

            {/* ── Search & Filter Bar ── */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text" placeholder="Search by email, name, or phone..."
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                        />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg border transition-colors ${showFilters || activeFilterCount > 0 ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        <Filter className="w-4 h-4" /> Filters
                        {activeFilterCount > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>}
                    </button>
                </div>

                {/* Filter Row */}
                {showFilters && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <FilterSelect label="City" value={filterCity} onChange={v => { setFilterCity(v); setPage(1); }} options={cities} />
                        <FilterSelect label="Status" value={filterStatus} onChange={v => { setFilterStatus(v); setPage(1); }} options={['active', 'unsubscribed', 'bounced']} />
                        <FilterSelect label="Budget" value={filterBudget} onChange={v => { setFilterBudget(v); setPage(1); }} options={['budget', 'mid', 'premium', 'luxury']} />
                        <FilterSelect label="Tag" value={filterTag} onChange={v => { setFilterTag(v); setPage(1); }}
                            options={TAG_CATEGORIES.flatMap(c => c.options)} />
                        {activeFilterCount > 0 && (
                            <button onClick={() => { setFilterCity(''); setFilterStatus(''); setFilterBudget(''); setFilterTag(''); setPage(1); }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <X className="w-3 h-3" /> Clear All
                            </button>
                        )}
                    </div>
                )}

                {/* Bulk Actions */}
                {selected.size > 0 && (
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{selected.size} selected</span>
                        <button onClick={() => { setTagTargets([...selected]); setShowTagModal(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors">
                            <Tag className="w-3.5 h-3.5" /> Tag Selected
                        </button>
                        <button onClick={handleBulkDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                        </button>
                        <button onClick={() => setSelected(new Set())}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-auto">
                            Deselect All
                        </button>
                    </div>
                )}
            </div>

            {/* ── Subscriber Table ── */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-gray-800/30">
                            <tr>
                                <th className="px-4 py-3 text-left w-10">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                        {selected.size === subscribers.length && subscribers.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <SortHeader label="Subscriber" field="email" current={sortBy} order={sortOrder} onSort={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                                <SortHeader label="Score" field="leadScore" current={sortBy} order={sortOrder} onSort={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tags</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">City</th>
                                <SortHeader label="Subscribed" field="subscribedAt" current={sortBy} order={sortOrder} onSort={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-slate-400">Loading subscribers...</span>
                                    </div>
                                </td></tr>
                            ) : subscribers.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <Mail className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                        <span className="text-sm text-slate-400">No subscribers found</span>
                                    </div>
                                </td></tr>
                            ) : subscribers.map(sub => {
                                const score = getScoreInfo(sub.leadScore);
                                const ScoreIcon = score.icon;
                                return (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={(e) => { if ((e.target as HTMLElement).closest('button, input')) return; setProfileId(sub.id); }}>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => toggleSelect(sub.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                                {selected.has(sub.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">{sub.name || sub.email}</div>
                                                {sub.name && <div className="text-xs text-slate-400 dark:text-slate-500">{sub.email}</div>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold ${score.bg} ${score.color} ring-1 ${score.ring}`}>
                                                <ScoreIcon className="w-3 h-3" />
                                                {sub.leadScore}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {sub.tags.slice(0, 3).map(tag => (
                                                    <span key={tag.id} className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${TAG_COLORS[tag.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                        {tag.value}
                                                    </span>
                                                ))}
                                                {sub.tags.length > 3 && <span className="text-[10px] text-slate-400">+{sub.tags.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {sub.city ? (
                                                <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400"><MapPin className="w-3 h-3" />{sub.city}</span>
                                            ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(sub.subscribedAt)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setTagTargets([sub.id]); setShowTagModal(true); }}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-400 hover:text-indigo-600 transition-colors" title="Add Tags">
                                                    <Tag className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setEditSub(sub); setEditForm({ name: sub.name || '', phone: sub.phone || '', city: sub.city || '', budgetTier: sub.budgetTier || '' }); }}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors" title="Edit">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(sub.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-slate-500">{total} subscribers · Page {page} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Profile Drawer ── */}
            {profileId && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setProfileId(null)} />
                    <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto border-l border-gray-200 dark:border-gray-800 animate-slideIn">
                        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Subscriber Profile</h3>
                            <button onClick={() => setProfileId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        {profileLoading || !profile ? (
                            <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                        ) : (
                            <div className="p-6 space-y-6">
                                {/* Profile Header */}
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/30">
                                        {(profile.name || profile.email)[0].toUpperCase()}
                                    </div>
                                    <h4 className="mt-3 font-semibold text-gray-900 dark:text-white text-lg">{profile.name || 'Unknown'}</h4>
                                    <p className="text-sm text-slate-500">{profile.email}</p>
                                    {profile.phone && <p className="text-sm text-slate-400 mt-0.5">{profile.phone}</p>}
                                    <div className="mt-3 flex items-center justify-center gap-4 text-sm">
                                        {(() => { const s = getScoreInfo(profile.leadScore); const I = s.icon; return (
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${s.bg} ${s.color} ring-1 ${s.ring} font-semibold`}>
                                                <I className="w-4 h-4" /> Score: {profile.leadScore} · {s.label}
                                            </div>
                                        ); })()}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <DetailCard label="City" value={profile.city || '—'} icon={MapPin} />
                                    <DetailCard label="Budget" value={profile.budgetTier || '—'} icon={Target} />
                                    <DetailCard label="Source" value={profile.source || '—'} icon={ArrowUpRight} />
                                    <DetailCard label="Status" value={profile.status} icon={Activity} />
                                </div>

                                {/* Tags */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Tags</h5>
                                        <button onClick={() => { setTagTargets([profile.id]); setShowTagModal(true); }}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.tags.length === 0 ? <span className="text-xs text-slate-400">No tags yet</span> : profile.tags.map(tag => (
                                            <span key={tag.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${TAG_COLORS[tag.category] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {tag.value}
                                                <button onClick={() => handleRemoveTag(tag.id)} className="ml-0.5 hover:text-red-500"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Activity Timeline</h5>
                                    {profile.events.length === 0 ? <p className="text-xs text-slate-400">No activity recorded yet</p> : (
                                        <div className="space-y-3">
                                            {profile.events.slice(0, 20).map(ev => (
                                                <div key={ev.id} className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{ev.eventType.replace(/_/g, ' ')}</p>
                                                        <p className="text-[11px] text-slate-400">{timeAgo(ev.createdAt)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button onClick={() => { setEditSub(profile); setEditForm({ name: profile.name || '', phone: profile.phone || '', city: profile.city || '', budgetTier: profile.budgetTier || '' }); }}
                                        className="flex-1 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
                                        Edit Profile
                                    </button>
                                    <button onClick={() => { setTagTargets([profile.id]); setShowTagModal(true); }}
                                        className="flex-1 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-colors">
                                        Add Tags
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── Tag Modal ── */}
            {showTagModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowTagModal(false)} />
                    <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Tag {tagTargets.length} subscriber{tagTargets.length > 1 ? 's' : ''}</h3>
                            <button onClick={() => setShowTagModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {TAG_CATEGORIES.map(cat => (
                                <div key={cat.key}>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{cat.label}</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cat.options.map(opt => {
                                            const isSelected = selectedTags.some(t => t.category === cat.key && t.value === opt);
                                            return (
                                                <button key={opt} onClick={() => {
                                                    if (isSelected) setSelectedTags(selectedTags.filter(t => !(t.category === cat.key && t.value === opt)));
                                                    else setSelectedTags([...selectedTags, { category: cat.key, value: opt }]);
                                                }}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${isSelected
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                                                        : `${TAG_COLORS[cat.key]} hover:shadow-sm`
                                                        }`}>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/30">
                            <span className="text-sm text-slate-500">{selectedTags.length} tags selected</span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowTagModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
                                <button onClick={handleBulkTag} disabled={selectedTags.length === 0}
                                    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm shadow-indigo-600/30 disabled:opacity-50 transition-colors">
                                    Apply Tags
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Edit Modal ── */}
            {editSub && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setEditSub(null)} />
                    <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Edit Subscriber</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{editSub.email}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name</label>
                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                                <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">City</label>
                                <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Budget Tier</label>
                                <select value={editForm.budgetTier} onChange={e => setEditForm({ ...editForm, budgetTier: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white">
                                    <option value="">Select...</option>
                                    <option value="budget">Budget</option>
                                    <option value="mid">Mid-Range</option>
                                    <option value="premium">Premium</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/30">
                            <button onClick={() => setEditSub(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
                            <button onClick={handleUpdateSub} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm shadow-indigo-600/30 transition-colors">Save</button>
                        </div>
                    </div>
                </>
            )}

            {/* ── Inline Styles ── */}
            <style jsx global>{`
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slideIn { animation: slideIn 0.25s ease-out; }
            `}</style>
        </div>
    );
}

// ═══════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: number; color: string; sub?: string }) {
    const colorMap: Record<string, string> = {
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
        red: 'from-red-500 to-red-600 shadow-red-500/30',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
        slate: 'from-slate-400 to-slate-500 shadow-slate-400/30',
    };
    return (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                </div>
            </div>
            {sub && <p className="text-[10px] text-slate-400 mt-2">{sub}</p>}
        </div>
    );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <select
            value={value} onChange={e => onChange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none min-w-[120px]"
        >
            <option value="">{label}: All</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}

function SortHeader({ label, field, current, order, onSort }: { label: string; field: string; current: string; order: string; onSort: (f: string, o: string) => void }) {
    const isActive = current === field;
    return (
        <th className="px-4 py-3 text-left">
            <button onClick={() => onSort(field, isActive && order === 'asc' ? 'desc' : 'asc')}
                className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {label}
                {isActive && <ChevronDown className={`w-3 h-3 transition-transform ${order === 'asc' ? 'rotate-180' : ''}`} />}
            </button>
        </th>
    );
}

function DetailCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{value}</p>
        </div>
    );
}
