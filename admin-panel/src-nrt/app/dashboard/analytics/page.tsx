'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import Link from 'next/link';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertTriangle,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw,
    BarChart3, PieChart as PieChartIcon, Activity, MapPin, Zap, Target,
    Calendar, ChevronDown, Download, Users, Repeat, Tag, Shield,
    ArrowRight, Percent, Award, TrendingUp as Growth, Layers
} from 'lucide-react';

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════
interface AnalyticsData {
    period: string;
    summary: { totalRevenue: number; pendingRevenue: number; lostRevenue: number; totalTransactions: number; completedCount: number; pendingCount: number; failedCount: number; avgOrderValue: number; successRate: number; };
    today: { revenue: number; sales: number; revenueChange: number; salesChange: number; };
    dailyRevenue: Array<{ date: string; revenue: number; count: number; failed: number }>;
    monthlyRevenue: Array<{ month: string; label: string; revenue: number; count: number; failed: number }>;
    gatewayBreakdown: Array<{ gateway: string; count: number; revenue: number; failed: number }>;
    statusBreakdown: Array<{ status: string; count: number }>;
    topRoutes: Array<{ route: string; revenue: number; bookings: number }>;
    hourlyDistribution: Array<{ hour: string; count: number }>;
    dayOfWeekDistribution: Array<{ day: string; revenue: number; count: number }>;
    weeklyComparison: { thisWeekRevenue: number; lastWeekRevenue: number; thisWeekSales: number; lastWeekSales: number; revenueChange: number; };
    monthlyComparison: { thisMonthRevenue: number; lastMonthRevenue: number; thisMonthSales: number; lastMonthSales: number; revenueChange: number; };
    customerAnalytics: { uniqueCustomers: number; repeatCustomers: number; repeatRate: number; topCustomers: Array<{ name: string; bookings: number }>; };
    couponAnalytics: { totalCouponUses: number; totalDiscountGiven: number; couponRate: number; topCoupons: Array<{ code: string; uses: number; discount: number }>; };
    gatewaySuccessRates: Array<{ gateway: string; total: number; success: number; rate: number }>;
    cumulativeRevenue: Array<{ date: string; cumulative: number }>;
    revenuePerSeat: number;
}

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════
const GW_COLORS: Record<string, string> = { esewa: '#60BB46', khalti: '#5C2D91', cash: '#F59E0B', visa: '#1A1F71' };
const ST_COLORS: Record<string, string> = { completed: '#10B981', pending: '#F59E0B', failed: '#EF4444', processing: '#3B82F6', refunded: '#8B5CF6' };
const CHART_PALETTE = ['#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6', '#06B6D4', '#EF4444', '#84CC16'];
const PERIODS = [
    { value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }, { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }, { value: 'all', label: 'All Time' },
];

const gwLabel = (g: string) => ({ esewa: 'eSewa', khalti: 'Khalti', cash: 'Cash', visa: 'Visa' }[g] || g);

// ═══════════════════════════════════════════
// Tooltip
// ═══════════════════════════════════════════
const CT = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-950 border border-gray-700 text-white px-4 py-3 rounded-xl shadow-2xl text-xs">
            <p className="text-gray-400 font-medium mb-1">{label}</p>
            {payload.map((e: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    <span className="text-gray-300">{e.name}:</span>
                    <span className="font-bold">{e.name?.toLowerCase().includes('rev') || e.name?.toLowerCase().includes('cum') || e.name?.toLowerCase().includes('amount') ? `NPR ${e.value?.toLocaleString()}` : e.value}</span>
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════
// Collapsible Section
// ═══════════════════════════════════════════
function CS({ icon: Icon, c, title, sub, badge, children, open: initOpen = false }: { icon: any; c: string; title: string; sub?: string; badge?: string; children: React.ReactNode; open?: boolean }) {
    const [open, setOpen] = useState(initOpen);
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${c}`}><Icon className="w-4 h-4" /></div>
                    <div className="text-left"><h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>{sub && <p className="text-[10px] text-gray-400">{sub}</p>}</div>
                </div>
                <div className="flex items-center gap-2">
                    {badge && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full hidden sm:block">{badge}</span>}
                    <div className={`p-1 rounded-lg transition-all duration-300 ${open ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rotate-180' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}><ChevronDown className="w-4 h-4" /></div>
                </div>
            </button>
            <div className={`transition-all duration-500 overflow-hidden ${open ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-2 border-t border-gray-50 dark:border-gray-800/50">{children}</div>
            </div>
        </div>
    );
}

// ═══ Comparison Card ═══
function CompCard({ label, current, previous, prefix = 'NPR ' }: { label: string; current: number; previous: number; prefix?: string }) {
    const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
    const up = change >= 0;
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{prefix}{current.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-2">
                <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${up ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'}`}>
                    {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(change)}%
                </span>
                <span className="text-[10px] text-gray-400">vs {prefix}{previous.toLocaleString()} prev</span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════
export default function AnalyticsPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');

    const fetch_ = async () => {
        setLoading(true);
        try { setData(await apiGet<AnalyticsData>(`/payments/analytics?period=${period}`, accessToken!)); } catch { }
        setLoading(false);
    };
    useEffect(() => { fetch_(); }, [accessToken, period]);

    // ═══ Multi-Sheet Excel Export ═══
    const exportAll = () => {
        if (!data) return;
        const { summary: s, dailyRevenue: dr, monthlyRevenue: mr, gatewayBreakdown: gb, topRoutes: tr, statusBreakdown: sb, customerAnalytics: ca, couponAnalytics: cp, gatewaySuccessRates: gsr, hourlyDistribution: hd, dayOfWeekDistribution: dw, weeklyComparison: wc, monthlyComparison: mc } = data;
        let csv = '';
        // Sheet 1: Executive Summary
        csv += '═══ EXECUTIVE SUMMARY ═══\n';
        csv += `Period,${data.period}\nTotal Revenue (NPR),${s.totalRevenue}\nPending Revenue (NPR),${s.pendingRevenue}\nLost Revenue (NPR),${s.lostRevenue}\n`;
        csv += `Total Transactions,${s.totalTransactions}\nCompleted,${s.completedCount}\nPending,${s.pendingCount}\nFailed,${s.failedCount}\nSuccess Rate,${s.successRate}%\nAvg Order Value (NPR),${s.avgOrderValue}\n`;
        csv += `Today Revenue (NPR),${data.today.revenue}\nToday Sales,${data.today.sales}\nRevenue vs Yesterday,${data.today.revenueChange}%\n`;
        csv += `Revenue Per Booking (NPR),${data.revenuePerSeat}\n`;
        // Sheet 2: Weekly Comparison
        csv += '\n═══ WEEKLY COMPARISON ═══\n';
        csv += `Metric,This Week,Last Week,Change\n`;
        csv += `Revenue (NPR),${wc.thisWeekRevenue},${wc.lastWeekRevenue},${wc.revenueChange}%\n`;
        csv += `Sales,${wc.thisWeekSales},${wc.lastWeekSales},${wc.lastWeekSales > 0 ? Math.round(((wc.thisWeekSales - wc.lastWeekSales) / wc.lastWeekSales) * 100) : 100}%\n`;
        // Sheet 3: Monthly Comparison
        csv += '\n═══ MONTHLY COMPARISON ═══\n';
        csv += `Metric,This Month,Last Month,Change\n`;
        csv += `Revenue (NPR),${mc.thisMonthRevenue},${mc.lastMonthRevenue},${mc.revenueChange}%\n`;
        csv += `Sales,${mc.thisMonthSales},${mc.lastMonthSales},${mc.lastMonthSales > 0 ? Math.round(((mc.thisMonthSales - mc.lastMonthSales) / mc.lastMonthSales) * 100) : 100}%\n`;
        // Sheet 4: Daily Revenue
        csv += '\n═══ DAILY REVENUE ═══\nDate,Revenue (NPR),Bookings,Failed Txns\n';
        dr.forEach(d => csv += `${d.date},${d.revenue},${d.count},${d.failed}\n`);
        // Sheet 5: Monthly Revenue
        csv += '\n═══ MONTHLY REVENUE ═══\nMonth,Revenue (NPR),Bookings,Failed Txns\n';
        mr.forEach(d => csv += `${d.label},${d.revenue},${d.count},${d.failed}\n`);
        // Sheet 6: Gateway Breakdown
        csv += '\n═══ PAYMENT GATEWAY BREAKDOWN ═══\nGateway,Transactions,Revenue (NPR),Failed,Success Rate\n';
        gb.forEach(g => { const sr = gsr.find(x => x.gateway === g.gateway); csv += `${gwLabel(g.gateway)},${g.count},${g.revenue},${g.failed},${sr?.rate || 0}%\n`; });
        // Sheet 7: Status Breakdown
        csv += '\n═══ STATUS BREAKDOWN ═══\nStatus,Count\n';
        sb.forEach(s => csv += `${s.status},${s.count}\n`);
        // Sheet 8: Top Routes
        csv += '\n═══ TOP ROUTES ═══\nRoute,Revenue (NPR),Bookings\n';
        tr.forEach(r => csv += `"${r.route}",${r.revenue},${r.bookings}\n`);
        // Sheet 9: Peak Hours
        csv += '\n═══ HOURLY DISTRIBUTION ═══\nHour,Bookings\n';
        hd.forEach(h => csv += `${h.hour},${h.count}\n`);
        // Sheet 10: Day of Week
        csv += '\n═══ DAY OF WEEK ═══\nDay,Revenue (NPR),Bookings\n';
        dw.forEach(d => csv += `${d.day},${d.revenue},${d.count}\n`);
        // Sheet 11: Customer Analytics
        csv += '\n═══ CUSTOMER ANALYTICS ═══\n';
        csv += `Unique Customers,${ca.uniqueCustomers}\nRepeat Customers,${ca.repeatCustomers}\nRepeat Rate,${ca.repeatRate}%\n`;
        csv += '\nTop Customers,Bookings\n';
        ca.topCustomers.forEach(c => csv += `"${c.name}",${c.bookings}\n`);
        // Sheet 12: Coupon Analytics
        csv += '\n═══ COUPON / DISCOUNT ANALYTICS ═══\n';
        csv += `Total Coupon Uses,${cp.totalCouponUses}\nTotal Discount Given (NPR),${cp.totalDiscountGiven}\nCoupon Usage Rate,${cp.couponRate}%\n`;
        if (cp.topCoupons.length) { csv += '\nCoupon Code,Uses,Discount (NPR)\n'; cp.topCoupons.forEach(c => csv += `${c.code},${c.uses},${c.discount}\n`); }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `NRT_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    if (loading && !data) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><RefreshCw className="w-10 h-10 mx-auto mb-4 text-indigo-500 animate-spin" /><p className="text-gray-500 text-sm">Loading analytics...</p></div></div>;
    if (!data) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-gray-500">Failed to load.</p></div>;

    const { summary: s, today, dailyRevenue, monthlyRevenue, gatewayBreakdown, statusBreakdown, topRoutes, hourlyDistribution, dayOfWeekDistribution, weeklyComparison: wc, monthlyComparison: mc, customerAnalytics: ca, couponAnalytics: cp, gatewaySuccessRates, cumulativeRevenue } = data;

    // Compute growth rates for monthly chart
    const monthlyWithGrowth = monthlyRevenue.map((m, i) => ({
        ...m,
        growth: i > 0 && monthlyRevenue[i - 1].revenue > 0 ? Math.round(((m.revenue - monthlyRevenue[i - 1].revenue) / monthlyRevenue[i - 1].revenue) * 100) : 0,
    }));

    return (
        <div className="space-y-4 pb-12">
            {/* ═══ HEADER ═══ */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/25"><BarChart3 className="w-5 h-5" /></div>
                        Revenue Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Financial intelligence &amp; business insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-8 text-sm font-semibold text-gray-700 dark:text-gray-300 outline-none cursor-pointer shadow-sm">
                        {PERIODS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={exportAll} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"><Download className="w-3.5 h-3.5" />Export Report</button>
                    <button onClick={fetch_} disabled={loading} className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"><RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
            </div>

            {/* ═══ HERO CARDS ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative"><div className="flex items-center gap-2 mb-2"><div className="p-1.5 bg-white/20 rounded-lg"><DollarSign className="w-3.5 h-3.5" /></div><span className="text-[9px] font-bold uppercase tracking-widest text-indigo-200">Realized Revenue</span></div>
                    <p className="text-2xl font-black">NPR {s.totalRevenue.toLocaleString()}</p>
                    <span className="text-[10px] text-indigo-200 bg-white/10 px-2 py-0.5 rounded-full mt-2 inline-block">{s.completedCount} sales</span></div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2"><div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /></div>
                    {today.revenueChange !== 0 && <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${today.revenueChange >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>{today.revenueChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(today.revenueChange)}%</span>}</div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">NPR {today.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Today&apos;s Revenue • {today.sales} bookings</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2"><div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /></div><span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{s.pendingCount} stuck</span></div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">NPR {s.pendingRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Pending Revenue</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2"><div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" /></div><span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{s.failedCount} failed</span></div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">NPR {s.lostRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Lost Revenue</p>
                </div>
            </div>

            {/* ═══ 1. KPIs ═══ */}
            <CS icon={ShoppingCart} c="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Key Performance Indicators" sub="Core business metrics" badge={`${s.totalTransactions} txns`} open>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-1">
                    {[{l:'Total Txns',v:s.totalTransactions,i:ShoppingCart,cl:'blue'},{l:'Avg Order',v:`NPR ${s.avgOrderValue.toLocaleString()}`,i:Target,cl:'purple'},{l:'Success Rate',v:`${s.successRate}%`,i:CheckCircle,cl:'emerald'},{l:'Failure Rate',v:`${s.totalTransactions>0?100-s.successRate:0}%`,i:XCircle,cl:'red'},{l:'Rev/Booking',v:`NPR ${data.revenuePerSeat.toLocaleString()}`,i:DollarSign,cl:'indigo'}].map((k,i)=>(
                        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                            <k.i className={`w-4 h-4 text-${k.cl}-500 mx-auto mb-1.5`} /><p className="text-lg font-black text-gray-900 dark:text-white">{k.v}</p><p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{k.l}</p>
                        </div>
                    ))}
                </div>
            </CS>

            {/* ═══ 2. Weekly & Monthly Comparison ═══ */}
            <CS icon={TrendingUp} c="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" title="Period Comparisons" sub="This week vs last week, this month vs last month" badge="compare" open>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                    <CompCard label="This Week Revenue" current={wc.thisWeekRevenue} previous={wc.lastWeekRevenue} />
                    <CompCard label="This Week Sales" current={wc.thisWeekSales} previous={wc.lastWeekSales} prefix="" />
                    <CompCard label="This Month Revenue" current={mc.thisMonthRevenue} previous={mc.lastMonthRevenue} />
                    <CompCard label="This Month Sales" current={mc.thisMonthSales} previous={mc.lastMonthSales} prefix="" />
                </div>
            </CS>

            {/* ═══ 3. Daily Revenue Area Chart ═══ */}
            <CS icon={Activity} c="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" title="Daily Revenue Trend" sub="Revenue, bookings and failures over time" badge={`${dailyRevenue.length} days`}>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyRevenue}>
                        <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={d=>new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'})} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CT/>}/><Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize:'10px',fontWeight:600,paddingBottom:'8px'}}/>
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2} fill="url(#rg)"/><Area type="monotone" dataKey="count" name="Bookings" stroke="#10B981" strokeWidth={1.5} fill="transparent"/><Area type="monotone" dataKey="failed" name="Failed" stroke="#EF4444" strokeWidth={1} fill="transparent" strokeDasharray="4 4"/>
                    </AreaChart>
                </ResponsiveContainer>
            </CS>

            {/* ═══ 4. Cumulative Revenue ═══ */}
            <CS icon={Growth} c="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" title="Cumulative Revenue Growth" sub="Running total over time" badge={`NPR ${(cumulativeRevenue[cumulativeRevenue.length-1]?.cumulative||0).toLocaleString()}`}>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={cumulativeRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={d=>new Date(d).toLocaleDateString('en',{month:'short',day:'numeric'})} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CT/>}/>
                        <Line type="monotone" dataKey="cumulative" name="Cumulative Revenue" stroke="#14B8A6" strokeWidth={2.5} dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </CS>

            {/* ═══ 5. Monthly Revenue Bar + Growth ═══ */}
            <CS icon={Calendar} c="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" title="Monthly Revenue & Growth" sub="Revenue bars with month-over-month growth %" badge={`${monthlyRevenue.length} months`}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyWithGrowth} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false}/><XAxis dataKey="label" tick={{fontSize:9,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false}/><YAxis yAxisId="left" tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CT/>}/><Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize:'10px',fontWeight:600,paddingBottom:'8px'}}/>
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366F1" radius={[6,6,0,0]}/><Bar yAxisId="left" dataKey="count" name="Sales" fill="#A5B4FC" radius={[6,6,0,0]}/><Line yAxisId="right" type="monotone" dataKey="growth" name="Growth %" stroke="#F97316" strokeWidth={2} dot={{r:3}}/>
                    </BarChart>
                </ResponsiveContainer>
            </CS>

            {/* ═══ 6-7. Gateway Pie + Status Pie Side by Side ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CS icon={PieChartIcon} c="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" title="Payment Methods" sub="Revenue by gateway" badge={`${gatewayBreakdown.length} methods`} open>
                    <div className="grid grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart><Pie data={gatewayBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={4} dataKey="revenue" nameKey="gateway" strokeWidth={0}>{gatewayBreakdown.map((e,i)=><Cell key={i} fill={GW_COLORS[e.gateway]||CHART_PALETTE[i]}/>)}</Pie><Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0].payload;return(<div className="bg-gray-950 text-white px-3 py-2 rounded-xl text-xs border border-gray-700"><p className="font-bold">{gwLabel(d.gateway)}</p><p>{d.count} txns • NPR {d.revenue?.toLocaleString()}</p></div>);}} /></PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 flex flex-col justify-center">{gatewayBreakdown.map((g,i)=>{const t=gatewayBreakdown.reduce((s,x)=>s+g.count?s+x.count:s,0)||1;const pct=Math.round((g.count/Math.max(gatewayBreakdown.reduce((s,x)=>s+x.count,0),1))*100);return(<div key={i} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:GW_COLORS[g.gateway]||CHART_PALETTE[i]}}/><span className="text-gray-600 dark:text-gray-300 flex-1">{gwLabel(g.gateway)}</span><span className="font-bold text-gray-900 dark:text-white">{pct}%</span></div>);})}</div>
                    </div>
                </CS>
                <CS icon={Target} c="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" title="Transaction Status" sub="Success vs failure distribution" badge={`${s.successRate}% ok`} open>
                    <div className="grid grid-cols-2 gap-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart><Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="status" strokeWidth={0}>{statusBreakdown.map((e,i)=><Cell key={i} fill={ST_COLORS[e.status]||'#94A3B8'}/>)}</Pie><Tooltip content={({active,payload})=>{if(!active||!payload?.length)return null;const d=payload[0].payload;return(<div className="bg-gray-950 text-white px-3 py-2 rounded-xl text-xs border border-gray-700"><p className="font-bold capitalize">{d.status}: {d.count}</p></div>);}} /></PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 flex flex-col justify-center">{statusBreakdown.map((ss,i)=>(<div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:ST_COLORS[ss.status]||'#94A3B8'}}/><span className="text-xs text-gray-600 dark:text-gray-300 capitalize flex-1">{ss.status}</span><span className="text-sm font-black text-gray-900 dark:text-white">{ss.count}</span></div>))}</div>
                    </div>
                </CS>
            </div>

            {/* ═══ 8. Gateway Success Rates ═══ */}
            <CS icon={Shield} c="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400" title="Gateway Reliability" sub="Success rate per payment method" badge="reliability">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    {gatewaySuccessRates.map((g,i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"><div className="h-full rounded-full transition-all duration-700" style={{width:`${g.rate}%`,background:GW_COLORS[g.gateway]||'#6366F1'}}/></div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{gwLabel(g.gateway)}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{g.rate}%</p>
                            <p className="text-[10px] text-gray-400 mt-1">{g.success}/{g.total} successful</p>
                        </div>
                    ))}
                </div>
            </CS>

            {/* ═══ 9-10. Peak Hours + Day of Week ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CS icon={Clock} c="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Peak Booking Hours" sub="24-hour booking distribution" badge="hourly">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={hourlyDistribution} barSize={12}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false}/><XAxis dataKey="hour" tick={{fontSize:8,fill:'#9CA3AF'}} axisLine={false} tickLine={false} interval={2}/><YAxis tick={{fontSize:9,fill:'#9CA3AF'}} axisLine={false} tickLine={false}/><Tooltip content={<CT/>}/><Bar dataKey="count" name="Bookings" fill="#3B82F6" radius={[3,3,0,0]}/></BarChart>
                    </ResponsiveContainer>
                </CS>
                <CS icon={Calendar} c="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" title="Day of Week Analysis" sub="Revenue by day of week" badge="weekly">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dayOfWeekDistribution} barSize={24}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false}/><XAxis dataKey="day" tick={{fontSize:10,fill:'#9CA3AF',fontWeight:600}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#9CA3AF'}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v} axisLine={false} tickLine={false}/><Tooltip content={<CT/>}/><Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize:'10px',fontWeight:600,paddingBottom:'8px'}}/><Bar dataKey="revenue" name="Revenue" fill="#F97316" radius={[6,6,0,0]}/><Bar dataKey="count" name="Bookings" fill="#FDBA74" radius={[6,6,0,0]}/></BarChart>
                    </ResponsiveContainer>
                </CS>
            </div>

            {/* ═══ 11. Top Routes ═══ */}
            <CS icon={MapPin} c="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" title="Top Revenue Routes" sub="Highest earning routes" badge={`${topRoutes.length} routes`}>
                {topRoutes.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No data yet</p> : (
                    <div className="space-y-3">{topRoutes.map((r,i)=>{const mx=topRoutes[0]?.revenue||1;return(
                        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5 flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-[10px] font-black shrink-0">#{i+1}</span>
                            <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{r.route}</p><div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1"><div className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full" style={{width:`${Math.round((r.revenue/mx)*100)}%`}}/></div></div>
                            <div className="text-right shrink-0"><p className="text-xs font-black text-gray-900 dark:text-white">NPR {r.revenue.toLocaleString()}</p><p className="text-[10px] text-gray-400">{r.bookings} bookings</p></div>
                        </div>);})}</div>
                )}
            </CS>

            {/* ═══ 12-13. Customer Analytics + Coupon Analytics ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CS icon={Users} c="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400" title="Customer Analytics" sub="Unique, repeat, and top customers" badge={`${ca.uniqueCustomers} unique`}>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-xl font-black text-gray-900 dark:text-white">{ca.uniqueCustomers}</p><p className="text-[9px] uppercase font-bold text-gray-400">Unique</p></div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-xl font-black text-gray-900 dark:text-white">{ca.repeatCustomers}</p><p className="text-[9px] uppercase font-bold text-gray-400">Repeat</p></div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-xl font-black text-gray-900 dark:text-white">{ca.repeatRate}%</p><p className="text-[9px] uppercase font-bold text-gray-400">Repeat Rate</p></div>
                    </div>
                    {ca.topCustomers.length > 0 && (<div><p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Top Customers</p><div className="space-y-1.5">{ca.topCustomers.map((c,i)=>(<div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"><div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center text-[9px] font-black">{i+1}</span><span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize truncate max-w-[120px]">{c.name}</span></div><span className="text-xs font-black text-gray-900 dark:text-white">{c.bookings} bookings</span></div>))}</div></div>)}
                </CS>
                <CS icon={Tag} c="bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400" title="Coupon & Discount Analytics" sub="Coupon usage and discount impact" badge={`${cp.couponRate}% usage`}>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-xl font-black text-gray-900 dark:text-white">{cp.totalCouponUses}</p><p className="text-[9px] uppercase font-bold text-gray-400">Coupons Used</p></div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-xl font-black text-gray-900 dark:text-white">NPR {cp.totalDiscountGiven.toLocaleString()}</p><p className="text-[9px] uppercase font-bold text-gray-400">Discount Given</p></div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center"><p className="text-xl font-black text-gray-900 dark:text-white">{cp.couponRate}%</p><p className="text-[9px] uppercase font-bold text-gray-400">Usage Rate</p></div>
                    </div>
                    {cp.topCoupons.length > 0 && (<div><p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Top Coupons</p><div className="space-y-1.5">{cp.topCoupons.map((c,i)=>(<div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2"><span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.code}</span><div className="text-right"><span className="text-xs font-bold text-gray-900 dark:text-white">{c.uses} uses</span><span className="text-[10px] text-gray-400 ml-2">-NPR {c.discount.toLocaleString()}</span></div></div>))}</div></div>)}
                </CS>
            </div>

            {/* ═══ 14. Conversion Funnel ═══ */}
            <CS icon={Layers} c="bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400" title="Payment Conversion Funnel" sub="Transaction flow from initiation to completion" badge="funnel">
                <div className="space-y-2 mt-1">
                    {[{l:'Total Initiated',v:s.totalTransactions,c:'bg-gray-200 dark:bg-gray-700',w:100},{l:'Processing / Pending',v:s.pendingCount,c:'bg-amber-400',w:s.totalTransactions>0?Math.round((s.pendingCount/s.totalTransactions)*100):0},{l:'Completed (Success)',v:s.completedCount,c:'bg-emerald-500',w:s.totalTransactions>0?Math.round((s.completedCount/s.totalTransactions)*100):0},{l:'Failed (Dropped)',v:s.failedCount,c:'bg-red-400',w:s.totalTransactions>0?Math.round((s.failedCount/s.totalTransactions)*100):0}].map((f,i)=>(
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-500 w-36 text-right">{f.l}</span>
                            <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative"><div className={`h-full ${f.c} rounded-lg transition-all duration-700 flex items-center px-3`} style={{width:`${f.w}%`}}><span className="text-[10px] font-black text-white drop-shadow">{f.v}</span></div></div>
                            <span className="text-xs font-bold text-gray-400 w-12 text-right">{f.w}%</span>
                        </div>
                    ))}
                </div>
            </CS>

            {/* ═══ Footer ═══ */}
            <div className="text-center pt-3 space-x-6">
                <Link href="/dashboard/payments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">View All Payments <ArrowUpRight className="w-3.5 h-3.5"/></Link>
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">Dashboard <ArrowRight className="w-3.5 h-3.5"/></Link>
            </div>
        </div>
    );
}
