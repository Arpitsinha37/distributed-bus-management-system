'use client';

import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { apiGet, apiPost } from '@/lib/api';
import { 
    CreditCard, Search, DollarSign, Wallet, Banknote, 
    CheckCircle, XCircle, Clock, TrendingUp, RefreshCw, 
    Download, Eye, Filter, ArrowUpDown, ChevronUp, ChevronDown, 
    X, User, Phone, MapPin, Calendar, Hash, Info, FileText
} from 'lucide-react';

interface Payment {
    id: string;
    ticketNo: string;
    method: string;
    amount: number;
    currency: string;
    status: string;
    transactionId?: string;
    passengerName?: string;
    passengerPhone?: string;
    passengerEmail?: string;
    route?: string;
    travelDate?: string;
    seatNumbers: string[];
    createdAt: string;
    finalizedAt?: string;
    gatewayResponse?: any;
    isFinalized?: boolean;
}

interface PaymentStats {
    total: number;
    totalCompleted: number;
    totalPending: number;
    totalFailed: number;
    esewaCount: number;
    khaltiCount: number;
    cashCount: number;
    realizedRevenue: number;
    pendingRevenue: number;
    lostRevenue: number;
    totalRevenue: number;
    gateways: {
        esewa: number;
        khalti: number;
        cash: number;
    };
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-blue-100 text-blue-700 animate-pulse',
};

const methodStyles: Record<string, { bg: string; text: string; label: string }> = {
    esewa: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'eSewa' },
    khalti: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Khalti' },
    cash_on_bus: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Cash on Bus' },
};

const getInternalCode = (payment: Payment) => {
    let internalCode = '-';
    if (payment.method === 'esewa' && payment.gatewayResponse) {
        if (payment.gatewayResponse.transaction_code) {
            internalCode = payment.gatewayResponse.transaction_code;
        } else if (typeof payment.gatewayResponse === 'string') {
            try {
                const parsed = JSON.parse(payment.gatewayResponse);
                if (parsed.transaction_code) internalCode = parsed.transaction_code;
            } catch(e) {}
        }
    }
    return internalCode;
};

export default function PaymentsPage() {
    const { accessToken } = useStore();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [methodFilter, setMethodFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Sort states
    const [sortField, setSortField] = useState<keyof Payment>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal states
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [forceCompleteId, setForceCompleteId] = useState<string | null>(null);
    const [manualTxnId, setManualTxnId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            // Fetch more for comprehensive client-side sorting/filtering
            let query = '?limit=200';
            if (methodFilter) query += `&method=${methodFilter}`;
            if (statusFilter) query += `&status=${statusFilter}`;
            const res = await apiGet<{ data: Payment[] }>(`/payments${query}`, accessToken!);
            setPayments(res.data || []);
        } catch { }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            let queryParams = new URLSearchParams();
            if (methodFilter) queryParams.append('method', methodFilter);
            if (statusFilter) queryParams.append('status', statusFilter);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

            const res = await apiGet<PaymentStats>(`/payments/stats${queryStr}`, accessToken!);
            setStats(res);
        } catch { }
    };

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, [accessToken, methodFilter, statusFilter, startDate, endDate]);

    const handleSync = async (paymentId: string) => {
        try {
            const res = await apiPost<{ message: string; payment: any }>(`/payments/${paymentId}/sync`, {}, accessToken!);
            alert(res.message);
            fetchPayments();
            fetchStats();
        } catch (err: any) {
            alert(err.message || 'Failed to sync payment');
        }
    };

    const handleForceComplete = async () => {
        if (!manualTxnId.trim()) return alert('Please enter a Bank Transaction ID / Reference');
        setSubmitting(true);
        try {
            await apiPost<any>(`/payments/${forceCompleteId}/force-complete`, { transactionId: manualTxnId }, accessToken!);
            alert('Payment successfully verified and marked as COMPLETED.');
            setForceCompleteId(null);
            setManualTxnId('');
            fetchPayments();
            fetchStats();
        } catch (err: any) {
            alert(err.message || 'Failed to force complete payment');
        }
        setSubmitting(false);
    };

    const toggleSort = (field: keyof Payment) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const filteredAndSorted = useMemo(() => {
        let result = payments.filter(p => {
            const matchesSearch = 
                (p.ticketNo?.toLowerCase().includes(search.toLowerCase())) ||
                (p.passengerName?.toLowerCase().includes(search.toLowerCase())) ||
                (p.passengerPhone?.includes(search)) ||
                (p.transactionId?.toLowerCase().includes(search.toLowerCase()));
            
            let matchesDate = true;
            if (startDate) {
                matchesDate = matchesDate && new Date(p.createdAt) >= new Date(startDate);
            }
            if (endDate) {
                // End date inclusive
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && new Date(p.createdAt) <= end;
            }

            return matchesSearch && matchesDate;
        });

        return result.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (!aVal) return 1;
            if (!bVal) return -1;
            
            let comparison = 0;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [payments, search, startDate, endDate, sortField, sortOrder]);

    const downloadCSV = () => {
        const headers = ['Date', 'Ticket No', 'Passenger', 'Phone', 'Route', 'Method', 'Amount', 'Status', 'Transaction ID', 'Internal Gateway Code'];
        const rows = filteredAndSorted.map(p => [
            new Date(p.createdAt).toLocaleString(),
            p.ticketNo,
            p.passengerName || '-',
            p.passengerPhone || '-',
            p.route || '-',
            p.method,
            p.amount,
            p.status,
            p.transactionId || '-',
            getInternalCode(p)
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-blue-500" /> Payment Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Professional dashboard for financial oversight and verification</p>
                </div>
                <button 
                    onClick={downloadCSV}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Realized Revenue</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">NPR {stats.realizedRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Pending Revenue</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">NPR {stats.pendingRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Lost Revenue</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">NPR {stats.lostRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm overflow-hidden">
                        <div className="flex items-start gap-3 h-full">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div className="w-full">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Gateway Breakdown</p>
                                <div className="space-y-0.5">
                                    <div className="flex justify-between items-center text-[10px] font-medium text-gray-900 dark:text-gray-300">
                                        <span>eSewa:</span> <span className="font-bold">NPR {stats.gateways?.esewa?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-medium text-gray-900 dark:text-gray-300">
                                        <span>Khalti:</span> <span className="font-bold">NPR {stats.gateways?.khalti?.toLocaleString() || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-medium text-gray-900 dark:text-gray-300">
                                        <span>Cash:</span> <span className="font-bold">NPR {stats.gateways?.cash?.toLocaleString() || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Status Bar */}
            {stats && (
                <div className="flex flex-wrap items-center gap-4 mb-6 px-1 text-xs font-semibold uppercase tracking-tight">
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                        <CheckCircle className="w-3.5 h-3.5" /> {stats.totalCompleted} Completed
                    </span>
                    <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                        <Clock className="w-3.5 h-3.5" /> {stats.totalPending} Pending
                    </span>
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        <XCircle className="w-3.5 h-3.5" /> {stats.totalFailed} Failed
                    </span>
                </div>
            )}

            {/* Advanced Filters */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ticket, name, phone, txn ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white"
                        />
                    </div>
                    
                    <div>
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm outline-none text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="">All Methods</option>
                            <option value="esewa">eSewa</option>
                            <option value="khalti">Khalti</option>
                            <option value="cash_on_bus">Cash on Bus</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm outline-none text-gray-900 dark:text-white cursor-pointer"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 md:col-span-2 lg:col-span-2">
                        <div className="relative flex-1">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs outline-none text-gray-900 dark:text-white"
                                title="Start Date"
                            />
                        </div>
                        <span className="text-gray-400 text-xs">to</span>
                        <div className="relative flex-1">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-xs outline-none text-gray-900 dark:text-white"
                                title="End Date"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th onClick={() => toggleSort('createdAt')} className="text-left px-5 py-4 font-semibold cursor-pointer hover:text-blue-500 transition-colors group">
                                    <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                        Date {sortField === 'createdAt' ? (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                                    </div>
                                </th>
                                <th className="text-left px-5 py-4 font-semibold uppercase tracking-wider text-[10px]">Ticket #</th>
                                <th className="text-left px-5 py-4 font-semibold uppercase tracking-wider text-[10px]">Product ID</th>
                                <th className="text-left px-5 py-4 font-semibold uppercase tracking-wider text-[10px]">Passenger</th>
                                <th className="text-left px-5 py-4 font-semibold uppercase tracking-wider text-[10px]">Method</th>
                                <th onClick={() => toggleSort('amount')} className="text-left px-5 py-4 font-semibold cursor-pointer hover:text-blue-500 transition-colors group">
                                    <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                        Amount {sortField === 'amount' ? (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                                    </div>
                                </th>
                                <th onClick={() => toggleSort('status')} className="text-left px-5 py-4 font-semibold cursor-pointer hover:text-blue-500 transition-colors group">
                                    <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                        Status {sortField === 'status' ? (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                                    </div>
                                </th>
                                <th className="text-left px-5 py-4 font-semibold uppercase tracking-wider text-[10px]">Transaction ID</th>
                                <th className="text-right px-5 py-4 font-semibold uppercase tracking-wider text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-20 text-gray-400">
                                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-20" />
                                    Loading payments...
                                </td></tr>
                            ) : filteredAndSorted.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-20 text-gray-400">No payments match your criteria</td></tr>
                            ) : filteredAndSorted.map((payment) => {
                                const ms = methodStyles[payment.method] || { bg: 'bg-gray-100', text: 'text-gray-700', label: payment.method };
                                return (
                                    <tr key={payment.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/20 transition-colors">
                                        <td className="px-5 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded font-mono text-[10px] uppercase font-bold tracking-tighter cursor-help" title="NRT Internal Ticket No">
                                                {payment.ticketNo}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-mono text-[10px] text-blue-500 font-semibold truncate max-w-[100px]" title={payment.id}>
                                                {payment.id}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-gray-900 dark:text-white font-semibold truncate max-w-[120px]">{payment.passengerName || '-'}</div>
                                            <div className="text-[10px] text-gray-500 font-medium">{payment.passengerPhone || ''}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${ms.bg} ${ms.text}`}>
                                                {ms.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">NPR {payment.amount?.toLocaleString()}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[payment.status] || ''}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="font-mono text-[10px] text-gray-500 max-w-[120px] truncate" title={payment.transactionId}>
                                                {payment.transactionId || '-'}
                                            </div>
                                            {getInternalCode(payment) !== '-' && (
                                                <div className="text-[10px] text-green-600 dark:text-green-400 font-bold mt-1" title="Internal Gateway Code">
                                                    Code: {getInternalCode(payment)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end items-center gap-1.5">
                                                <button 
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                                    title="View Full Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {payment.status === 'pending' && payment.method !== 'cash_on_bus' && (
                                                    <button 
                                                        onClick={() => handleSync(payment.id)} 
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                                                        title="Sync Status"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(payment.status === 'failed' || (payment.status === 'pending' && payment.method !== 'cash_on_bus')) && (
                                                    <button 
                                                        onClick={() => setForceCompleteId(payment.id)} 
                                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-all"
                                                        title="Professional Verification (Manual)"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAIL MODAL */}
            {selectedPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl scale-in-center">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-900">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Payment # {selectedPayment.ticketNo}</h2>
                                <p className="text-xs text-gray-500">Overview of customer booking and transaction audit</p>
                            </div>
                            <button onClick={() => setSelectedPayment(null)} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h3 className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-2 mb-4 tracking-widest">
                                        <User className="w-3.5 h-3.5" /> Customer Identity
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Full Name</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPayment.passengerName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Phone Number</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPayment.passengerPhone || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Email Address</span>
                                            <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">{selectedPayment.passengerEmail || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-2 mt-8 mb-4 tracking-widest">
                                        <MapPin className="w-3.5 h-3.5" /> Travel Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Route</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPayment.route || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Travel Date</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPayment.travelDate || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Seat Numbers</span>
                                            <div className="flex gap-1">
                                                {selectedPayment.seatNumbers?.map(s => (
                                                    <span key={s} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedPayment.method?.toLowerCase() === 'esewa' && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Transaction ID</span>
                                                <span className="font-mono text-[10px] text-gray-900 dark:text-white font-bold">
                                                    {(selectedPayment.gatewayResponse as any)?.ref_id || (selectedPayment.gatewayResponse as any)?.transaction_code || selectedPayment.transactionId || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                        {selectedPayment.method?.toLowerCase() === 'khalti' && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">PIDX</span>
                                                <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                                                    {(selectedPayment.gatewayResponse as any)?.pidx || (selectedPayment.gatewayResponse as any)?.idx || selectedPayment.transactionId || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-2 mb-4 tracking-widest">
                                        <CreditCard className="w-3.5 h-3.5" /> Transaction Audit
                                    </h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-3 mt-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Product ID</span>
                                            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{selectedPayment.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Merchant Method</span>
                                            <span className="font-bold text-gray-900 dark:text-white uppercase text-[10px]">{selectedPayment.method}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Gross Amount</span>
                                            <span className="font-bold text-gray-900 dark:text-white">NPR {selectedPayment.amount}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-800">
                                            <span className="text-gray-400">Gateway Ref</span>
                                            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 truncate max-w-[120px]">{selectedPayment.transactionId || 'NO_REF'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Created At</span>
                                            <span className="text-[10px]">{new Date(selectedPayment.createdAt).toLocaleString()}</span>
                                        </div>
                                        {selectedPayment.finalizedAt && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Finalized At</span>
                                                <span className="text-[10px] text-green-500 font-bold">{new Date(selectedPayment.finalizedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-2 mt-6 mb-2 tracking-widest">
                                        <FileText className="w-3.5 h-3.5" /> Gateway Response Snippet
                                    </h3>
                                    <pre className="text-[9px] bg-black text-green-400 p-3 rounded-lg overflow-x-auto font-mono max-h-[150px]">
                                        {JSON.stringify(selectedPayment.gatewayResponse || { message: "No data logs available" }, null, 2)}
                                    </pre>
                                </section>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={() => setSelectedPayment(null)} className="px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                Close Overlay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MANUAL VERIFICATION MODAL */}
            {forceCompleteId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Info className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Manual Verification Required</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-8">
                                Please provide the actual <strong>Bank Transaction ID</strong> from the screenshot provided by the customer. This will be permanently recorded and sent in the confirmation email.
                            </p>
                            
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Verified Transaction Ref</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 192837465 or ESEWA-8271" 
                                        value={manualTxnId}
                                        onChange={(e) => setManualTxnId(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-8 flex flex-col gap-3">
                                <button 
                                    onClick={handleForceComplete}
                                    disabled={submitting || !manualTxnId}
                                    className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} 
                                    Confirm & Send Ticket
                                </button>
                                <button 
                                    onClick={() => setForceCompleteId(null)}
                                    className="w-full py-4 text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-sm uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
