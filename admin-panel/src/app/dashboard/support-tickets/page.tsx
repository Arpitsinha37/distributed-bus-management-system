'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Check, X, AlertCircle } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { useStore } from '@/lib/store';

export default function SupportTicketsPage() {
    const { accessToken } = useStore();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await apiGet('/support-tickets?limit=50', accessToken!);
            setTickets(res.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
            alert('Failed to load support tickets. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) fetchTickets();
    }, [accessToken]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        try {
            setActionLoading(id);
            await apiPatch(`/support-tickets/${id}/${action}`, {
                adminNotes: `Action manually taken by admin via dashboard on ${new Date().toLocaleString()}`,
            }, accessToken!);
            alert(`Ticket ${action}d successfully`);
            fetchTickets();
        } catch (error) {
            console.error(`Failed to ${action} ticket`, error);
            alert(`Failed to ${action} ticket. Please try again.`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">Pending</span>;
            case 'approved': return <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">Approved</span>;
            case 'rejected': return <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">Rejected</span>;
            default: return <span className="inline-flex items-center rounded-md border border-slate-200 px-2.5 py-0.5 text-xs font-semibold">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#DC143C]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#DC143C] pl-4">Support Tickets</h1>
                    <p className="text-slate-500 mt-2 pl-4">Manage AI-generated customer cancellation and inquiry requests.</p>
                </div>
                <button
                    onClick={fetchTickets}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 px-4 py-2 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No tickets found</h3>
                    <p className="mt-1 text-sm text-slate-500">There are currently no support tickets requiring your attention.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {tickets.map((ticket: any) => (
                        <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col space-y-1.5 p-6 bg-slate-50/50 border-b border-slate-100 pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold leading-none tracking-tight text-lg">Ticket {ticket.ticketNo}</h3>
                                            {getStatusBadge(ticket.status)}
                                            <span className="inline-flex items-center rounded-md border border-transparent bg-slate-100 px-2.5 py-0.5 uppercase text-xs font-semibold text-slate-900">{ticket.type}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Submitted on {new Date(ticket.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-900">{ticket.passengerName || 'Unknown Passenger'}</div>
                                        <div className="text-sm text-slate-500">{ticket.passengerPhone || 'No Phone'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-700 mb-1">Customer Reason:</h4>
                                            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100 min-h-[60px]">
                                                {ticket.reason || <span className="text-slate-400 italic">No reason provided.</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-blue-500" />
                                            Booking Details
                                        </h4>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-blue-700/70">Route:</dt>
                                                <dd className="font-medium text-blue-900">{ticket.route || 'N/A'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-blue-700/70">Travel Date:</dt>
                                                <dd className="font-medium text-blue-900">{ticket.travelDate || 'N/A'}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-blue-700/70">Seats:</dt>
                                                <dd className="font-medium text-blue-900">{ticket.seatNumbers?.join(', ') || 'N/A'}</dd>
                                            </div>
                                            {ticket.amount && (
                                                <div className="flex justify-between border-t border-blue-200/50 pt-2 mt-2">
                                                    <dt className="font-medium text-blue-900">Total Amount:</dt>
                                                    <dd className="font-bold text-blue-700">NPR {ticket.amount}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                </div>

                                {ticket.status === 'pending' && (
                                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                                        <button
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium border text-rose-600 border-rose-200 hover:bg-rose-50 px-4 py-2 bg-white transition-colors disabled:opacity-50"
                                            onClick={() => handleAction(ticket.id, 'reject')}
                                            disabled={actionLoading === ticket.id}
                                        >
                                            {actionLoading === ticket.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                            Reject Request
                                        </button>
                                        <button
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 px-4 py-2 transition-colors disabled:opacity-50"
                                            onClick={() => handleAction(ticket.id, 'approve')}
                                            disabled={actionLoading === ticket.id}
                                        >
                                            {actionLoading === ticket.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                            Approve Cancellation
                                        </button>
                                    </div>
                                )}

                                {ticket.adminNotes && (
                                    <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-500">
                                        <span className="font-semibold text-slate-700">Admin Notes: </span>
                                        {ticket.adminNotes}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
