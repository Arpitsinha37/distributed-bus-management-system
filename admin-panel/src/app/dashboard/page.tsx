'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import Link from 'next/link';
import {
    Ticket, TrendingUp, Users, Clock, CheckCircle,
    DollarSign, Bus, MapPin, Mountain, Car, CreditCard,
    CalendarDays, XCircle, RefreshCw, MoreVertical, LayoutDashboard
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface PaymentStats {
    total: number;
    totalCompleted: number;
    totalPending: number;
    totalFailed: number;
    esewaCount: number;
    khaltiCount: number;
    cashCount: number;
    totalRevenue: number;
}

interface Payment {
    id: string;
    ticketNo: string;
    method: string;
    amount: number;
    status: string;
    passengerName: string | null;
    passengerPhone: string | null;
    route: string | null;
    travelDate: string | null;
    seatNumbers: string[];
    createdAt: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500',
    confirmed: 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-500',
    completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500',
    cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500',
    failed: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

const revenueData = [
    { name: 'Mon', Revenue: 4000 },
    { name: 'Tue', Revenue: 3000 },
    { name: 'Wed', Revenue: 2000 },
    { name: 'Thu', Revenue: 2780 },
    { name: 'Fri', Revenue: 1890 },
    { name: 'Sat', Revenue: 2390 },
    { name: 'Sun', Revenue: 3490 },
];

export default function DashboardPage() {
    const { user, accessToken } = useStore();
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
    const [busCount, setBusCount] = useState<number>(0);
    const [tourCount, setTourCount] = useState<number>(0);
    const [rentalCount, setRentalCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const [payStats, payments, buses, tours, rentals] = await Promise.all([
                apiGet<PaymentStats>('/payments/stats', accessToken).catch(() => null),
                apiGet<{ data: Payment[] }>('/payments?limit=8', accessToken).catch(() => ({ data: [] })),
                apiGet<any[]>('/bus-services?limit=10', accessToken).catch(() => []),
                apiGet<any[]>('/tour-packages?limit=10', accessToken).catch(() => []),
                apiGet<any[]>('/vehicle-rentals?limit=10', accessToken).catch(() => []),
            ]);
            if (payStats) setStats(payStats);
            setRecentPayments(payments?.data || []);
            setBusCount(Array.isArray(buses) ? buses.length : 0);
            setTourCount(Array.isArray(tours) ? tours.length : 0);
            setRentalCount(Array.isArray(rentals) ? rentals.length : 0);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, [accessToken]);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = recentPayments.filter(p => p.createdAt && p.createdAt.startsWith(todayStr));

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    // Helper for cards to match materio
    const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
        <div className={`bg-materio-surfaceLight dark:bg-materio-surfaceDark rounded-2xl shadow-materio dark:shadow-materio-dark p-6 ${className}`}>
            {children}
        </div>
    );

    return (
        <div className="space-y-6">
            
            {/* Top Row: Welcome & Small Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Welcome Hero Card */}
                <div className="lg:col-span-2 relative overflow-hidden bg-materio-surfaceLight dark:bg-materio-surfaceDark rounded-2xl shadow-materio dark:shadow-materio-dark flex items-center border border-brand-100 dark:border-brand-900/20">
                    <div className="p-8 relative z-10 w-full sm:w-2/3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Congratulations {user?.firstName}! 🎉
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                            You have completed <span className="font-bold text-gray-900 dark:text-white">{todayBookings.length}</span> bookings today. Check your new badge in your profile and continue the great work.
                        </p>
                        <button onClick={fetchAll} disabled={loading} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors shadow-md shadow-brand-500/30 flex items-center gap-2">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Stats
                        </button>
                    </div>
                    {/* Decorative abstract shape inspired by materio */}
                    <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-brand-50 to-transparent dark:from-brand-900/20 z-0 pointer-events-none hidden sm:block"></div>
                </div>

                {/* 2x2 Mini Stats block inside the top row */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 mb-4">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {loading ? '...' : `NPR ${stats?.totalRevenue?.toLocaleString() ?? 0}`}
                        </h3>
                    </Card>

                    <Card className="flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {loading ? '...' : stats?.total ?? 0}
                        </h3>
                    </Card>
                </div>
            </div>

            {/* Middle Row: Revenue Chart & More Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Recharts Graph */}
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Report</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Weekly Performance Overview</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="Revenue" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Services/Payment Breakdown List */}
                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Services Breakdown</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Metrics by Type</p>
                        </div>
                    </div>
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mr-4">
                                <Bus className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">Buses</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{loading ? '...' : busCount}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }}></div></div>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mr-4">
                                <Mountain className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">Tours</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{loading ? '...' : tourCount}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '45%' }}></div></div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mr-4">
                                <Car className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-900 dark:text-white">Rentals</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{loading ? '...' : rentalCount}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '30%' }}></div></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Modern Clean Table */}
            <Card className="px-0 pb-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest transactions from your clients.</p>
                    </div>
                    <Link href="/dashboard/bookings" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                        View All
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-y border-gray-100 dark:border-gray-800">
                            <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                <th className="text-left px-6 py-4 font-semibold whitespace-nowrap">Ticket / Date</th>
                                <th className="text-left px-6 py-4 font-semibold">Passenger</th>
                                <th className="text-left px-6 py-4 font-semibold">Route</th>
                                <th className="text-left px-6 py-4 font-semibold">Amount</th>
                                <th className="text-left px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400 font-medium">Loading records...</td></tr>
                            ) : recentPayments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-400">
                                    <Ticket className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    No recent bookings found.
                                </td></tr>
                            ) : recentPayments.slice(0, 5).map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-brand-600 dark:text-brand-400 mb-0.5">{p.ticketNo}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" /> {p.travelDate || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{p.passengerName || 'N/A'}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{p.passengerPhone || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="truncate max-w-[150px] font-medium">{p.route || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-900 dark:text-white">NPR {p.amount?.toLocaleString()}</div>
                                        <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-800 inline-block px-1.5 py-0.5 rounded mt-1">
                                            {p.method?.replace('_', ' ') || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${statusColors[p.status.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
