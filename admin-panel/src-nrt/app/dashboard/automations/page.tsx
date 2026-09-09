'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/useAuth';
import {
    Activity, Play, Pause, Plus, Trash2, Settings, Users, ArrowRight,
    Clock, Zap, CheckCircle2, ChevronRight, Tag, Mail, TrendingUp,
    Filter, LayoutGrid
} from 'lucide-react';

interface Workflow {
    id: string; name: string; description: string; isActive: boolean;
    triggerType: 'event_based' | 'schedule_based';
    triggerConfig: any; conditions: any; actions: any;
    enrollCount: number; completeCount: number; createdAt: string;
}

export default function AutomationsPage() {
    const { authFetch, API_URL } = useAuth();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'build'>('list');

    // Builder State
    const [wfId, setWfId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [triggerType, setTriggerType] = useState('event_based');

    // Trigger Config
    const [eventType, setEventType] = useState('email_opened');
    const [timeDelay, setTimeDelay] = useState('0'); // For schedule

    // Conditions: Array of single rules that are implicitly ANDed for simplicity
    // More complex trees can be supported later
    const [rules, setRules] = useState<any[]>([]);

    // Actions
    const [actions, setActions] = useState<any[]>([]);

    // Campaigns list for the 'send_email' action
    const [campaigns, setCampaigns] = useState<any[]>([]);

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${API_URL}/automations`);
            setWorkflows(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    const fetchCampaigns = useCallback(async () => {
        try {
            const res = await authFetch(`${API_URL}/campaigns`);
            setCampaigns(await res.json());
        } catch (e) { }
    }, []);

    useEffect(() => { fetchWorkflows(); fetchCampaigns(); }, []);

    const handleSave = async () => {
        if (!name) return alert('Workflow needs a name');
        if (actions.length === 0) return alert('Add at least one action');

        const triggerConfig = triggerType === 'event_based' ? { eventType } : { delayDays: timeDelay };

        // Wrap rules in an AND block
        const conditions = rules.length > 0 ? { op: 'AND', rules } : {};

        const data = { name, description, triggerType, triggerConfig, conditions, actions };

        try {
            if (wfId) {
                await authFetch(`${API_URL}/automations/${wfId}`, { method: 'PUT', body: JSON.stringify(data) });
            } else {
                await authFetch(`${API_URL}/automations`, { method: 'POST', body: JSON.stringify(data) });
            }
            setView('list');
            fetchWorkflows();
        } catch (e) { console.error(e); }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await authFetch(`${API_URL}/automations/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive: !current }) });
            fetchWorkflows();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this automation?')) return;
        try {
            await authFetch(`${API_URL}/automations/${id}`, { method: 'DELETE' });
            fetchWorkflows();
        } catch (e) { console.error(e); }
    };

    const editWorkflow = (w: Workflow) => {
        setWfId(w.id); setName(w.name); setDescription(w.description || '');
        setTriggerType(w.triggerType);
        if (w.triggerType === 'event_based') setEventType(w.triggerConfig?.eventType || 'email_opened');
        else setTimeDelay(w.triggerConfig?.delayDays || '0');

        if (w.conditions?.op === 'AND' && Array.isArray(w.conditions.rules)) {
            setRules(w.conditions.rules);
        } else {
            setRules([]);
        }

        setActions(Array.isArray(w.actions) ? w.actions : []);
        setView('build');
    };

    const resetBuilder = () => {
        setWfId(null); setName(''); setDescription(''); setTriggerType('event_based');
        setRules([]); setActions([]); setView('build');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        Automation Engine
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Build event-driven funnels to convert subscribers into bookings</p>
                </div>
                {view === 'list' ? (
                    <button onClick={resetBuilder} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
                        <Plus className="w-4 h-4" /> New Automation
                    </button>
                ) : (
                    <button onClick={() => setView('list')} className="border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm">
                        Back to List
                    </button>
                )}
            </div>

            {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workflows.map(w => (
                        <div key={w.id} className={`bg-white dark:bg-white/5 border rounded-xl overflow-hidden transition-all ${w.isActive ? 'border-indigo-200 dark:border-indigo-500/30 shadow-md shadow-indigo-500/10' : 'border-gray-200 dark:border-white/10 opacity-75 grayscale-[0.2]'}`}>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${w.triggerType === 'event_based' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {w.triggerType === 'event_based' ? <Zap className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <button onClick={() => toggleStatus(w.id, w.isActive)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${w.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {w.isActive ? <><CheckCircle2 className="w-3 h-3" /> Active</> : <><Pause className="w-3 h-3" /> Paused</>}
                                    </button>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{w.name}</h3>
                                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">{w.description}</p>

                                <div className="mt-5 grid grid-cols-2 gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{w.enrollCount}</p>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Entered</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{w.completeCount}</p>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Completed</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <button onClick={() => editWorkflow(w)} className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-xs font-medium transition-colors">
                                        Edit Workflow
                                    </button>
                                    <button onClick={() => handleDelete(w.id)} className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'build' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Visual Builder Canvas */}
                    <div className="col-span-1 lg:col-span-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 relative min-h-[600px]">
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        <div className="relative z-10 max-w-xl mx-auto space-y-4">
                            {/* 1. TRIGGER BLOCK */}
                            <div className="bg-white dark:bg-gray-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-xl p-5 shadow-lg shadow-indigo-500/5 z-20 relative">
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-gray-900">1</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Zap className="w-4 h-4 text-indigo-500" /> When this happens... (Trigger)
                                </h3>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button onClick={() => setTriggerType('event_based')} className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${triggerType === 'event_based' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                        <Activity className="w-4 h-4 mb-2 opacity-70" /> Event Occurs
                                    </button>
                                    <button onClick={() => setTriggerType('schedule_based')} className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${triggerType === 'schedule_based' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                        <Clock className="w-4 h-4 mb-2 opacity-70" /> Time Based
                                    </button>
                                </div>

                                {triggerType === 'event_based' ? (
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Listen for Event Type</label>
                                        <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-indigo-500">
                                            <option value="email_opened">Email Opened</option>
                                            <option value="email_clicked">Email Link Clicked</option>
                                            <option value="page_visited">Website Page Visited</option>
                                            <option value="inquiry_started">Inquiry Started</option>
                                            <option value="booking_made">Booking Completed</option>
                                            <option value="tag_added">Tag Added</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Trigger for everyone</label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled checks run automatically to evaluate if subscribers meet the conditions below.</p>
                                    </div>
                                )}
                            </div>

                            {/* Connector line */}
                            <div className="w-1 h-6 bg-gray-200 dark:bg-gray-800 mx-auto"></div>

                            {/* 2. CONDITIONS BLOCK */}
                            <div className="bg-white dark:bg-gray-900 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-xl p-5 shadow-lg shadow-emerald-500/5 z-20 relative">
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-gray-900">2</div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-emerald-500" /> Only if... (Conditions)
                                    </h3>
                                    <button onClick={() => setRules([...rules, { field: 'city', operator: 'equals', value: '' }])} className="text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 px-2 py-1 rounded">
                                        + Add Rule
                                    </button>
                                </div>

                                {rules.length === 0 ? (
                                    <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-500">No conditions. Proceeds immediately.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {rules.map((rule, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                                {idx > 0 && <span className="text-xs font-bold text-emerald-600 px-2">AND</span>}
                                                <select value={rule.field} onChange={e => { const r = [...rules]; r[idx].field = e.target.value; setRules(r); }} className="p-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                                                    <option value="city">City</option>
                                                    <option value="tag">Tag</option>
                                                    <option value="budgetTier">Budget Tier</option>
                                                    <option value="leadScore">Lead Score</option>
                                                    <option value="source">Source</option>
                                                </select>
                                                <select value={rule.operator} onChange={e => { const r = [...rules]; r[idx].operator = e.target.value; setRules(r); }} className="p-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-24">
                                                    <option value="equals">Equals</option>
                                                    <option value="not_equals">Is Not</option>
                                                    <option value="contains">Contains</option>
                                                    {rule.field === 'leadScore' && <option value="gt">Greater (&gt;)</option>}
                                                    {rule.field === 'leadScore' && <option value="lt">Less (&lt;)</option>}
                                                </select>
                                                <input value={rule.value} onChange={e => { const r = [...rules]; r[idx].value = e.target.value; setRules(r); }} placeholder="Value..." className="flex-1 p-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-w-0" />
                                                <button onClick={() => setRules(rules.filter((_, i) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-900 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Connector line */}
                            <div className="w-1 h-6 bg-gray-200 dark:bg-gray-800 mx-auto"></div>

                            {/* 3. ACTIONS BLOCK */}
                            <div className="bg-white dark:bg-gray-900 border-2 border-fuchsia-200 dark:border-fuchsia-900/50 rounded-xl p-5 shadow-lg shadow-fuchsia-500/5 z-20 relative">
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-gray-900">3</div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-fuchsia-500" /> Then do this... (Actions)
                                    </h3>
                                    <button onClick={() => setActions([...actions, { type: 'send_email', campaignId: '' }])} className="text-xs font-medium text-fuchsia-600 hover:bg-fuchsia-50 dark:text-fuchsia-400 dark:hover:bg-fuchsia-900/30 px-2 py-1 rounded">
                                        + Add Action
                                    </button>
                                </div>

                                {actions.length === 0 ? (
                                    <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-500">Flow completes without actions.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {actions.map((act, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800 relative group">
                                                <div className="absolute -left-2 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-[9px] font-bold flex items-center justify-center">{idx + 1}</div>
                                                <select value={act.type} onChange={e => { const a = [...actions]; a[idx].type = e.target.value; setActions(a); }} className="p-2 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium">
                                                    <option value="send_email">Send Email Campaign</option>
                                                    <option value="add_tag">Add Tag</option>
                                                    <option value="increment_score">Update Lead Score</option>
                                                </select>

                                                {act.type === 'send_email' && (
                                                    <select value={act.campaignId} onChange={e => { const a = [...actions]; a[idx].campaignId = e.target.value; setActions(a); }} className="flex-1 p-2 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-w-0">
                                                        <option value="">Select Campaign...</option>
                                                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                )}

                                                {act.type === 'add_tag' && (
                                                    <input value={act.value || ''} onChange={e => { const a = [...actions]; a[idx].value = e.target.value; setActions(a); }} placeholder="e.g. Hot Lead" className="flex-1 p-2 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-w-0" />
                                                )}

                                                {act.type === 'increment_score' && (
                                                    <input type="number" value={act.amount || 10} onChange={e => { const a = [...actions]; a[idx].amount = Number(e.target.value); setActions(a); }} placeholder="Points to add" className="flex-1 p-2 text-sm rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-w-0" />
                                                )}

                                                <button onClick={() => setActions(actions.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta Config Sidebar */}
                    <div className="col-span-1 lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-500" /> Automation Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">Workflow Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cart Abandonment" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What does this do?" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Save Workflow
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
