'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface OverviewData {
    totalBookings: number;
    totalRevenue: number;
    todayBookings: number;
    todayRevenue: number;
    totalCustomers: number;
    recentBookings: {
        id: string;
        ref: string;
        customer: string;
        route: string;
        amount: number;
        date: string;
    }[];
    revenueByDay: {
        date: string;
        revenue: number;
    }[];
}

export default function AnalyticsPage() {
    const { accessToken } = useStore();
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOverview = async () => {
        try {
            const res = await apiGet<OverviewData>('/reporting/overview', accessToken!);
            setData(res);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchOverview(); }, [accessToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!data) return <p className="p-10 text-center text-gray-500">Failed to load analytics data.</p>;

    return (
        <div className="pb-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-brand-500" /> Analytics Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of your business performance</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500 text-sm">Total Revenue</h3>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">NPR {data.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-green-600 flex items-center mt-2 font-medium">
                        <TrendingUp className="w-3 h-3 mr-1" /> Lifetime
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500 text-sm">Today's Revenue</h3>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">NPR {data.todayRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-2">
                        For {new Date().toLocaleDateString()}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500 text-sm">Total Bookings</h3>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalBookings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-2">
                        <span className="text-blue-500 font-bold mr-1">{data.todayBookings}</span> today
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500 text-sm">Total Customers</h3>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalCustomers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-2">
                        Registered unique users
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 glass-card p-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue (Last 7 Days)</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.revenueByDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickMargin={10} tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getMonth() + 1}/${d.getDate()}`;
                                }} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `NPR ${value}`} />
                                <RechartsTooltip 
                                    formatter={(value: number) => [`NPR ${value.toLocaleString()}`, 'Revenue']}
                                    labelFormatter={(label) => `Date: ${label}`}
                                    contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.07)' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={4} dot={{ r: 4, fill: '#14b8a6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
                        <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                        {data.recentBookings.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No recent bookings</p>
                        ) : data.recentBookings.map((b) => (
                            <div key={b.id} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-white/40">
                                <div>
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">{b.customer}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{b.route}</div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-mono">{b.ref}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">NPR {b.amount}</div>
                                    <div className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        Confirmed
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
