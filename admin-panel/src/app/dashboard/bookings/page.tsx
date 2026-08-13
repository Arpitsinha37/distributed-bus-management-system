'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPatch } from '@/lib/api';
import {
    Ticket, Search, Eye, CheckCircle, XCircle, Clock, Download,
    CalendarDays, TrendingUp, Users, IndianRupee, ChevronDown, ChevronRight,
    Filter, RefreshCw, Phone, Mail, MapPin, CreditCard, AlertCircle, Plus
} from 'lucide-react';
import CounterBookingModal from '@/components/CounterBookingModal';

interface Payment {
    id: string;
    ticketNo: string;
    method: string;
    amount: number;
    currency: string;
    status: string;
    transactionId: string | null;
    passengerName: string | null;
    passengerPhone: string | null;
    passengerEmail: string | null;
    route: string | null;
    travelDate: string | null;
    seatNumbers: string[];
    createdAt: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    completed: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    cancelled: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const statusIcons: Record<string, any> = {
    pending: Clock,
    confirmed: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
};

function formatDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
}

function formatDateKey(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
    } catch { return dateStr || 'unknown'; }
}

function isToday(dateStr: string) {
    return formatDateKey(dateStr) === new Date().toISOString().split('T')[0];
}

function isTomorrow(dateStr: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateKey(dateStr) === tomorrow.toISOString().split('T')[0];
}

function getDayLabel(dateStr: string) {
    if (isToday(dateStr)) return 'Today';
    if (isTomorrow(dateStr)) return 'Tomorrow';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    } catch { return ''; }
}

export default function BookingsPage() {
    const { accessToken } = useStore();
    const [bookings, setBookings] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selected, setSelected] = useState<Payment | null>(null);
    const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [showCounterModal, setShowCounterModal] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const query = statusFilter ? `?status=${statusFilter}` : '';
            const res = await apiGet<{ data: any[] }>(`/bookings${query}`, accessToken!);
            
            // Map the booking API structure to our UI shape
            const mappedBookings = (res.data || []).map(b => ({
                id: b.id,
                ticketNo: b.bookingRef,
                method: b.payment?.gateway || 'UNKNOWN',
                amount: Number(b.totalFare),
                currency: 'NPR',
                status: b.status.toLowerCase(),
                transactionId: b.payment?.gatewayTxnId || null,
                passengerName: b.customerName,
                passengerPhone: b.customerPhone,
                passengerEmail: b.customerEmail,
                route: b.trip?.schedule?.route ? `${b.trip.schedule.route.origin} - ${b.trip.schedule.route.destination}` : null,
                travelDate: b.trip?.travelDate ? b.trip.travelDate.split('T')[0] : null,
                seatNumbers: b.seats?.map((s: any) => s.seatNumber) || [],
                createdAt: b.createdAt
            }));
            setBookings(mappedBookings);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchBookings(); }, [accessToken, statusFilter]);

    const handleCancelBooking = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this booking? Refund will be calculated based on the policy.')) return;
        try {
            const res = await apiPost(`/bookings/${id}/cancel`, {}, accessToken!);
            alert(`Booking cancelled. Refund: NPR ${res.refundAmount} (${res.refundPercent}%).`);
            fetchBookings();
            setSelected(null);
        } catch (err: any) {
            alert(err.message || 'Failed to cancel');
        }
    };

    const handleResendTicket = (ticketNo: string) => {
        alert(`SMS ticket resent for booking ${ticketNo}!`);
    };

    // Filter by search + date range
    const filtered = useMemo(() => {
        let result = bookings.filter(b =>
            b.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
            (b.passengerPhone && b.passengerPhone.includes(search)) ||
            (b.passengerName && b.passengerName.toLowerCase().includes(search.toLowerCase())) ||
            (b.route && b.route.toLowerCase().includes(search.toLowerCase()))
        );

        if (dateFrom) {
            result = result.filter(b => b.travelDate && b.travelDate >= dateFrom);
        }
        if (dateTo) {
            result = result.filter(b => b.travelDate && b.travelDate <= dateTo);
        }

        return result;
    }, [bookings, search, dateFrom, dateTo]);

    // Group by travel date
    const groupedByDay = useMemo(() => {
        const groups: Record<string, Payment[]> = {};
        filtered.forEach(b => {
            const key = b.travelDate ? formatDateKey(b.travelDate) : 'no-date';
            if (!groups[key]) groups[key] = [];
            groups[key].push(b);
        });

        // Sort the keys
        const sortedKeys = Object.keys(groups).sort((a, b) =>
            sortOrder === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
        );

        return sortedKeys.map(key => ({
            date: key,
            bookings: groups[key],
            totalAmount: groups[key].reduce((s, b) => s + (b.amount || 0), 0),
            totalSeats: groups[key].reduce((s, b) => s + (b.seatNumbers?.length || 0), 0),
        }));
    }, [filtered, sortOrder]);

    // Stats
    const stats = useMemo(() => {
        const total = filtered.length;
        const revenue = filtered.reduce((s, b) => s + (b.amount || 0), 0);
        const pending = filtered.filter(b => b.status === 'pending').length;
        const completed = filtered.filter(b => b.status === 'completed').length;
        const confirmed = filtered.filter(b => b.status === 'confirmed').length;
        const totalSeats = filtered.reduce((s, b) => s + (b.seatNumbers?.length || 0), 0);
        return { total, revenue, pending, completed, confirmed, totalSeats };
    }, [filtered]);

    const toggleDay = (date: string) => {
        setCollapsedDays(prev => {
            const next = new Set(prev);
            if (next.has(date)) next.delete(date);
            else next.add(date);
            return next;
        });
    };

    // Excel Export
    const exportToExcel = () => {
        const header = ['Travel Date', 'Ticket No', 'Passenger', 'Phone', 'Email', 'Route', 'Seats', 'Amount (NPR)', 'Status', 'Payment Method', 'Booking Created'];
        const rows = groupedByDay.flatMap(group =>
            group.bookings.map(b => [
                b.travelDate || 'N/A',
                b.ticketNo,
                b.passengerName || 'N/A',
                b.passengerPhone || 'N/A',
                b.passengerEmail || 'N/A',
                b.route || 'N/A',
                b.seatNumbers?.join(', ') || '',
                b.amount?.toString() || '0',
                b.status,
                b.method || 'N/A',
                b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A',
            ])
        );

        // Add day-wise summary rows
        const summaryRows: string[][] = [[], ['--- DAY-WISE SUMMARY ---'], ['Date', 'Total Bookings', 'Total Seats', 'Total Revenue (NPR)']];
        groupedByDay.forEach(g => {
            summaryRows.push([
                g.date === 'no-date' ? 'No Date' : formatDate(g.date),
                g.bookings.length.toString(),
                g.totalSeats.toString(),
                g.totalAmount.toLocaleString(),
            ]);
        });

        const csvContent = [header, ...rows, ...summaryRows]
            .map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `bookings_${dateFrom || 'all'}_to_${dateTo || 'all'}_exported_${dateStr}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
    };

    const hasFilters = search || statusFilter || dateFrom || dateTo;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg shadow-red-500/20">
                            <Ticket className="w-5 h-5" />
                        </div>
                        Booking Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View, manage, and export all bookings</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowCounterModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-red-500/20">
                        <Plus className="w-4 h-4" /> New Booking
                    </button>
                    <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={filtered.length === 0}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bookings · {stats.totalSeats} seats</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">NPR {stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total earnings</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting action</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Done</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed + stats.confirmed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed + Confirmed</p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ticket #, name, phone, or route..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
                                placeholder="From"
                            />
                            <span className="text-gray-300 dark:text-gray-600 text-xs">→</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
                                placeholder="To"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                            <option value="">All Status</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✅ Confirmed</option>
                            <option value="completed">🔵 Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
                        >
                            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
                        </button>

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-3 py-2.5 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Day-Wise Booking Groups */}
            {loading ? (
                <div className="text-center py-20 text-gray-400">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
                    <p>Loading bookings...</p>
                </div>
            ) : groupedByDay.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No bookings found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : groupedByDay.map(group => {
                const isCollapsed = collapsedDays.has(group.date);
                const dayLabel = group.date === 'no-date' ? 'No Date' : getDayLabel(group.date);
                const dateDisplay = group.date === 'no-date' ? 'Unscheduled' : formatDate(group.date);
                const isTodayGroup = group.date !== 'no-date' && isToday(group.date);

                return (
                    <div key={group.date} className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden transition-all ${isTodayGroup ? 'border-red-200 dark:border-red-800 ring-1 ring-red-100 dark:ring-red-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                        {/* Day Header */}
                        <button
                            onClick={() => toggleDay(group.date)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {isCollapsed ? <ChevronRight className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">{dateDisplay}</span>
                                        {dayLabel && (
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isTodayGroup ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {dayLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">{group.bookings.length} bookings</p>
                                    <p className="text-gray-400 text-xs">{group.totalSeats} seats</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">NPR {group.totalAmount.toLocaleString()}</p>
                                    <p className="text-gray-400 text-xs">revenue</p>
                                </div>
                            </div>
                        </button>

                        {/* Bookings Table */}
                        {!isCollapsed && (
                            <div className="border-t border-gray-100 dark:border-gray-800">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/80 dark:bg-gray-800/50">
                                        <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="text-left px-5 py-3 font-semibold">Ticket #</th>
                                            <th className="text-left px-5 py-3 font-semibold">Passenger</th>
                                            <th className="text-left px-5 py-3 font-semibold">Route</th>
                                            <th className="text-left px-5 py-3 font-semibold">Seats</th>
                                            <th className="text-left px-5 py-3 font-semibold">Amount</th>
                                            <th className="text-left px-5 py-3 font-semibold">Status</th>
                                            <th className="text-right px-5 py-3 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                        {group.bookings.map((payment) => {
                                            const StatusIcon = statusIcons[payment.status] || AlertCircle;
                                            return (
                                                <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <span className="font-mono font-bold text-gray-900 dark:text-white text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{payment.ticketNo}</span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{payment.passengerName || 'N/A'}</p>
                                                            {payment.passengerPhone && (
                                                                <p className="text-gray-400 text-xs mt-0.5">{payment.passengerPhone}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            {payment.route || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {payment.seatNumbers?.slice(0, 5).map((s, i) => (
                                                                <span key={i} className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">{s}</span>
                                                            ))}
                                                            {(payment.seatNumbers?.length || 0) > 5 && (
                                                                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">+{payment.seatNumbers.length - 5}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <p className="font-bold text-gray-900 dark:text-white">NPR {payment.amount?.toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColors[payment.status] || ''}`}>
                                                            <StatusIcon className="w-3.5 h-3.5" />
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleResendTicket(payment.ticketNo)}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Resend SMS Ticket"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                        </button>
                                                        {payment.status === 'confirmed' || payment.status === 'completed' ? (
                                                            <button
                                                                onClick={() => handleCancelBooking(payment.id)}
                                                                className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                                title="Cancel Booking"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        ) : null}
                                                        <button
                                                            onClick={() => setSelected(payment)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Results Footer */}
            {!loading && filtered.length > 0 && (
                <div className="text-center text-xs text-gray-400 py-2">
                    Showing {filtered.length} booking{filtered.length !== 1 ? 's' : ''} across {groupedByDay.length} day{groupedByDay.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 text-white">
                            <p className="text-xs font-medium text-white/70 mb-1">Booking Details</p>
                            <p className="text-xl font-bold font-mono tracking-wide">{selected.ticketNo}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Passenger</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-gray-400" />
                                            {selected.passengerName || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            {selected.passengerPhone || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                            {selected.passengerEmail || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Route</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            {selected.route || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Travel Date</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                                            {selected.travelDate ? formatDate(selected.travelDate) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Payment</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                            {selected.method || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Seats Booked</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.seatNumbers?.map((s, i) => (
                                            <span key={i} className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Amount</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">NPR {selected.amount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${statusColors[selected.status] || ''}`}>
                                        {selected.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex gap-3">
                            <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCounterModal && (
                <CounterBookingModal 
                    onClose={() => setShowCounterModal(false)} 
                    onSuccess={() => {
                        setShowCounterModal(false);
                        fetchBookings();
                    }}
                />
            )}
        </div>
    );
}
