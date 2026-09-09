'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/useAuth';
import {
    Send, Sparkles, Plus, Trash2, Eye, Clock, CheckCircle2,
    AlertCircle, X, ChevronDown, Mail, Target, Users, RefreshCw,
    Wand2, Copy, ArrowRight, Filter, BarChart3, Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
interface Campaign {
    id: string; name: string; subject: string; preheader: string;
    htmlContent: string; targetFilter: any; status: string;
    recipientCount: number; sentCount: number; failedCount: number;
    sentAt: string | null; createdAt: string;
}
interface AiContent {
    subject: string; preheader: string; heading: string;
    body: string; cta_text: string; cta_url: string; tagline: string;
}

const CAMPAIGN_TYPES = [
    { key: 'promotional', label: '🎯 Promotional', desc: 'Promote a specific package or destination' },
    { key: 'seasonal', label: '🌸 Seasonal', desc: 'Season-specific travel offers' },
    { key: 're-engagement', label: '🔄 Re-engagement', desc: 'Bring back inactive subscribers' },
    { key: 'welcome', label: '👋 Welcome', desc: 'New subscriber welcome email' },
    { key: 'newsletter', label: '📰 Newsletter', desc: 'Weekly/monthly travel updates' },
];

const DESTINATIONS = ['Pokhara', 'Chitwan', 'Lumbini', 'Kathmandu Valley', 'Nagarkot', 'Mustang', 'Everest Region', 'Annapurna', 'Langtang', 'Rara Lake', 'Ilam', 'Bandipur'];
const TRAVEL_TYPES = ['Adventure', 'Cultural', 'Pilgrimage', 'Relaxation', 'Photography', 'Wildlife', 'Trekking', 'Honeymoon'];
const TONES = ['warm', 'excited', 'professional', 'urgent', 'friendly', 'inspirational'];

function statusBadge(status: string) {
    const map: Record<string, { bg: string; text: string; icon: any }> = {
        draft: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: Clock },
        sending: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', icon: Loader2 },
        sent: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600', icon: CheckCircle2 },
        failed: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', icon: AlertCircle },
    };
    const s = map[status] || map.draft;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
            <Icon className={`w-3 h-3 ${status === 'sending' ? 'animate-spin' : ''}`} /> {status}
        </span>
    );
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function CampaignsPage() {
    const { authFetch, API_URL } = useAuth();

    // State
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'create'>('list');

    // Create form
    const [campaignName, setCampaignName] = useState('');
    const [campaignType, setCampaignType] = useState('promotional');
    const [destination, setDestination] = useState('');
    const [travelType, setTravelType] = useState('');
    const [budgetTier, setBudgetTier] = useState('');
    const [tone, setTone] = useState('warm');
    const [customPrompt, setCustomPrompt] = useState('');

    // AI generated
    const [aiContent, setAiContent] = useState<AiContent | null>(null);
    const [generating, setGenerating] = useState(false);

    // Editing
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');

    // Targeting
    const [targetCity, setTargetCity] = useState('');
    const [targetTag, setTargetTag] = useState('');
    const [targetBudget, setTargetBudget] = useState('');
    const [targetMinScore, setTargetMinScore] = useState('');
    const [recipientCount, setRecipientCount] = useState<number | null>(null);

    // Send
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<any>(null);
    const [testEmail, setTestEmail] = useState('');
    const [testSending, setTestSending] = useState(false);

    // Preview
    const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

    // ── Fetch Campaigns ──
    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${API_URL}/campaigns`);
            setCampaigns(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchCampaigns(); }, []);

    // ── Generate AI Content ──
    const handleGenerate = async () => {
        setGenerating(true);
        setAiContent(null);
        try {
            const res = await authFetch(`${API_URL}/campaigns/ai/generate`, {
                method: 'POST',
                body: JSON.stringify({
                    campaignType, destination, travelType, budgetTier, tone, customPrompt,
                }),
            });
            const data = await res.json();
            setAiContent(data);
            setEditSubject(data.subject);
            setEditBody(`<h2>${data.heading}</h2>\n${data.body}\n<p><a href="${data.cta_url}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;">${data.cta_text}</a></p>\n<p style="color:#9ca3af;font-style:italic;">${data.tagline}</p>`);
        } catch (e: any) {
            alert('AI generation failed: ' + (e?.message || 'Unknown error'));
        }
        setGenerating(false);
    };

    // ── Preview Recipients ──
    const handlePreviewRecipients = async () => {
        try {
            const res = await authFetch(`${API_URL}/campaigns/preview/recipients`, {
                method: 'POST',
                body: JSON.stringify({
                    city: targetCity || undefined,
                    tag: targetTag || undefined,
                    budgetTier: targetBudget || undefined,
                    minScore: targetMinScore ? Number(targetMinScore) : undefined,
                }),
            });
            const data = await res.json();
            setRecipientCount(data.count);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { handlePreviewRecipients(); }, [targetCity, targetTag, targetBudget, targetMinScore]);

    // ── Create & Send Campaign ──
    const handleCreateCampaign = async () => {
        if (!campaignName || !editSubject || !editBody) {
            alert('Please fill in campaign name, subject, and content');
            return;
        }

        try {
            const res = await authFetch(`${API_URL}/campaigns`, {
                method: 'POST',
                body: JSON.stringify({
                    name: campaignName,
                    subject: editSubject,
                    preheader: aiContent?.preheader || '',
                    htmlContent: editBody,
                    targetFilter: {
                        city: targetCity || undefined,
                        tag: targetTag || undefined,
                        budgetTier: targetBudget || undefined,
                        minScore: targetMinScore ? Number(targetMinScore) : undefined,
                    },
                }),
            });
            const campaign = await res.json();
            alert('Campaign created as draft! You can now send it.');
            setView('list');
            fetchCampaigns();
            resetForm();
        } catch (e) { console.error(e); }
    };

    const handleSendCampaign = async (id: string) => {
        if (!confirm('Send this campaign to all matching subscribers? This action cannot be undone.')) return;
        setSending(true);
        setSendResult(null);
        try {
            const res = await authFetch(`${API_URL}/campaigns/${id}/send`, { method: 'POST' });
            const result = await res.json();
            setSendResult(result);
            fetchCampaigns();
        } catch (e) { console.error(e); }
        setSending(false);
    };

    const handleSendTest = async (id: string) => {
        if (!testEmail) { alert('Enter a test email address'); return; }
        setTestSending(true);
        try {
            await authFetch(`${API_URL}/campaigns/${id}/test`, {
                method: 'POST',
                body: JSON.stringify({ email: testEmail }),
            });
            alert(`Test email sent to ${testEmail}!`);
        } catch (e) { console.error(e); alert('Test send failed'); }
        setTestSending(false);
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Delete this campaign?')) return;
        try {
            await authFetch(`${API_URL}/campaigns/${id}`, { method: 'DELETE' });
            fetchCampaigns();
        } catch (e) { console.error(e); }
    };

    const resetForm = () => {
        setCampaignName(''); setCampaignType('promotional'); setDestination('');
        setTravelType(''); setBudgetTier(''); setTone('warm'); setCustomPrompt('');
        setAiContent(null); setEditSubject(''); setEditBody('');
        setTargetCity(''); setTargetTag(''); setTargetBudget(''); setTargetMinScore('');
        setRecipientCount(null); setSendResult(null);
    };

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        AI Campaign Studio
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate AI-powered travel emails and send to subscribers</p>
                </div>
                <div className="flex items-center gap-2">
                    {view === 'list' ? (
                        <button onClick={() => { setView('create'); resetForm(); }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-600/30 transition-all">
                            <Plus className="w-4 h-4" /> New Campaign
                        </button>
                    ) : (
                        <button onClick={() => { setView('list'); resetForm(); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Back to List
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ LIST VIEW ═══ */}
            {view === 'list' && (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Sparkles className="w-12 h-12 text-violet-300 dark:text-violet-700" />
                            <p className="text-slate-500 text-sm">No campaigns yet</p>
                            <button onClick={() => { setView('create'); resetForm(); }}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white">
                                <Plus className="w-4 h-4" /> Create Your First Campaign
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {campaigns.map(c => (
                                <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2.5">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{c.name}</h3>
                                            {statusBadge(c.status)}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">{c.subject}</p>
                                        <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-400">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.recipientCount} recipients</span>
                                            {c.sentCount > 0 && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" /> {c.sentCount} sent</span>}
                                            {c.failedCount > 0 && <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3 h-3" /> {c.failedCount} failed</span>}
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-4">
                                        {c.status === 'draft' && (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <input type="email" placeholder="Test email…" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                                                        className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 w-36 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300" />
                                                    <button onClick={() => handleSendTest(c.id)} disabled={testSending}
                                                        className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-50">
                                                        {testSending ? '…' : 'Test'}
                                                    </button>
                                                </div>
                                                <button onClick={() => handleSendCampaign(c.id)} disabled={sending}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-600/30 disabled:opacity-50 transition-colors">
                                                    <Send className="w-3 h-3" /> {sending ? 'Sending...' : 'Send'}
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => setPreviewCampaign(c)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteCampaign(c.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ CREATE VIEW ═══ */}
            {view === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: AI Generation */}
                    <div className="space-y-5">
                        {/* Campaign Name */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Campaign Name</label>
                            <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Spring Pokhara Promo"
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white" />
                        </div>

                        {/* AI Generator */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-sm shadow-violet-500/30">
                                    <Wand2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI Content Generator</h3>
                                    <p className="text-[11px] text-slate-400">Powered by Gemini AI</p>
                                </div>
                            </div>

                            {/* Campaign Type */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Campaign Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CAMPAIGN_TYPES.map(t => (
                                        <button key={t.key} onClick={() => setCampaignType(t.key)}
                                            className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${campaignType === t.key
                                                ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-900/30 dark:text-violet-300'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                            <span className="font-medium">{t.label}</span>
                                            <p className="text-[10px] mt-0.5 opacity-70">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Destination</label>
                                    <select value={destination} onChange={e => setDestination(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300">
                                        <option value="">Any</option>
                                        {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Travel Type</label>
                                    <select value={travelType} onChange={e => setTravelType(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300">
                                        <option value="">Any</option>
                                        {TRAVEL_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Budget</label>
                                    <select value={budgetTier} onChange={e => setBudgetTier(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300">
                                        <option value="">Any</option>
                                        <option value="budget">Budget</option>
                                        <option value="mid">Mid-Range</option>
                                        <option value="premium">Premium</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tone</label>
                                    <select value={tone} onChange={e => setTone(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300">
                                        {TONES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Custom Instructions (optional)</label>
                                <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} rows={2} placeholder="e.g. Include winter trekking tips, mention Dashain festival discount…"
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white resize-none" />
                            </div>

                            <button onClick={handleGenerate} disabled={generating}
                                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-600/30 disabled:opacity-50 transition-all">
                                {generating ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating with AI...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Generate Email with AI</>
                                )}
                            </button>
                        </div>

                        {/* Audience Targeting */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                    <Target className="w-4 h-4 text-violet-500" /> Audience Targeting
                                </h3>
                                {recipientCount !== null && (
                                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full">
                                        {recipientCount} subscribers match
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-medium text-slate-500 mb-1">City</label>
                                    <input value={targetCity} onChange={e => setTargetCity(e.target.value)} placeholder="All cities"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Tag</label>
                                    <input value={targetTag} onChange={e => setTargetTag(e.target.value)} placeholder="All tags"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Budget Tier</label>
                                    <select value={targetBudget} onChange={e => setTargetBudget(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none text-gray-700 dark:text-gray-300">
                                        <option value="">All</option>
                                        <option value="budget">Budget</option>
                                        <option value="mid">Mid-Range</option>
                                        <option value="premium">Premium</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Min Lead Score</label>
                                    <input type="number" value={targetMinScore} onChange={e => setTargetMinScore(e.target.value)} placeholder="0"
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-violet-500 text-gray-700 dark:text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Edit */}
                    <div className="space-y-5">
                        {/* Subject & Content Editor */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5 space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-violet-500" /> Email Content
                                {aiContent && <span className="text-[10px] text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1.5 py-0.5 rounded-full">AI Generated ✨</span>}
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject Line</label>
                                <input value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Enter email subject…"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white font-medium" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Body (HTML)</label>
                                <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={12} placeholder="Your email content here… (supports HTML)"
                                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-violet-500 outline-none text-gray-900 dark:text-white resize-y" />
                            </div>
                        </div>

                        {/* Live Preview */}
                        {editBody && (
                            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-violet-500" /> Live Preview
                                    </h3>
                                </div>
                                <div className="p-4 bg-gray-100 dark:bg-gray-800/30">
                                    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                                        {/* Mini email header */}
                                        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} className="px-4 py-6 text-center">
                                            <p className="text-white font-bold text-sm">New Road Travels & Tours</p>
                                            <p className="text-white/70 text-[10px]">Nepal&#39;s #1 Trusted Travel Company</p>
                                        </div>
                                        <div className="px-4 py-4">
                                            <p className="text-gray-700 dark:text-gray-300 text-xs mb-3">Hi <strong>Traveler</strong>,</p>
                                            <div className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed email-preview"
                                                dangerouslySetInnerHTML={{ __html: editBody }} />
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 text-center bg-gray-50 dark:bg-gray-800/30">
                                            <p className="text-[9px] text-gray-400">New Road Travels & Tours (P.) Ltd. • Kathmandu, Nepal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Create Button */}
                        <button onClick={handleCreateCampaign} disabled={!campaignName || !editSubject || !editBody}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-600/30 disabled:opacity-40 transition-all">
                            <Send className="w-4 h-4" /> Save Campaign as Draft
                        </button>

                        {sendResult && (
                            <div className={`p-4 rounded-xl border ${sendResult.failed > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'}`}>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    ✅ Sent: {sendResult.sent} · ❌ Failed: {sendResult.failed} · Total: {sendResult.total}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ PREVIEW MODAL ═══ */}
            {previewCampaign && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setPreviewCampaign(null)} />
                    <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[80vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{previewCampaign.name}</h3>
                                <p className="text-xs text-slate-400">{previewCampaign.subject}</p>
                            </div>
                            <button onClick={() => setPreviewCampaign(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="p-6">
                            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} className="rounded-t-xl px-6 py-8 text-center">
                                <p className="text-white font-bold text-lg">New Road Travels & Tours</p>
                                <p className="text-white/70 text-xs">Nepal&#39;s #1 Trusted Travel Company</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b-xl px-6 py-5">
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">Hi <strong>Traveler</strong>,</p>
                                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: previewCampaign.htmlContent }} />
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            {statusBadge(previewCampaign.status)}
                            <span className="text-xs text-slate-400">{previewCampaign.recipientCount} recipients · {previewCampaign.sentCount} sent</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
