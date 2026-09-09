'use client';
import React, { useState } from 'react';
import { Search, Ticket, Bus, Calendar, Armchair, CheckCircle, XCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function TrackPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const searchVal = searchQuery.trim();
        if (!searchVal) return;

        setLoading(true);
        setError(null);
        setBookings([]);
        setSearched(true);

        try {
            const res = await api.get('/bookings/track', { params: { q: searchVal } });
            setBookings(Array.isArray(res.data) ? res.data : [res.data]);
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.response?.data?.message || 'No bookings found for this search. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
            <div className="max-w-lg mx-auto">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
                        <Ticket className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Track My Booking</h1>
                    <p className="text-sm text-gray-500">Enter your phone or ticket number to view booking status</p>
                </div>

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-sm border-0 outline-none bg-transparent font-medium text-gray-800 placeholder:text-gray-400"
                                placeholder="Enter phone or ticket no..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl text-sm hover:from-red-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-sm active:scale-[0.98]"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : 'Track'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="text-red-400 w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">No Bookings Found</h3>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                )}

                {bookings.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium px-1">
                            {bookings.length} booking{bookings.length > 1 ? 's' : ''} found
                        </p>

                        {bookings.map((booking, idx) => {
                            const routeParts = booking.route ? booking.route.split('→').map((s: string) => s.trim()) : [];
                            const source = routeParts[0] || '—';
                            const destination = routeParts[1] || '—';

                            return (
                                <Link
                                    key={booking.ticketNo + '-' + idx}
                                    href={`/ticket/${booking.ticketNo}`}
                                    className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="text-emerald-500 w-4 h-4" />
                                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Confirmed</span>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">{booking.ticketNo}</span>
                                    </div>

                                    <div className="px-5 py-4 space-y-3">
                                        {booking.route && (
                                            <div className="flex items-center gap-3">
                                                <Bus className="text-red-400 w-4 h-4 shrink-0" />
                                                <span className="text-sm font-bold text-gray-900">{source}</span>
                                                <span className="text-gray-300">→</span>
                                                <span className="text-sm font-bold text-gray-900">{destination}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            {booking.travelDate && (
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="text-blue-400 w-4 h-4" /> {booking.travelDate}
                                                </span>
                                            )}
                                            {booking.seatNumbers?.length > 0 && (
                                                <span className="flex items-center gap-1.5">
                                                    <Armchair className="text-emerald-400 w-4 h-4" /> Seat {booking.seatNumbers.join(', ')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <span className="text-xs text-gray-400">
                                                {booking.passengerName || 'Passenger'}
                                            </span>
                                            <span className="font-bold text-gray-900 text-sm">रू {booking.amount}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                <Phone className="text-blue-400 w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Need help?</p>
                                <p className="text-xs text-gray-500">Call us at <strong>9856068470</strong> for assistance with your booking.</p>
                            </div>
                        </div>
                    </div>
                )}

                {!searched && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center gap-4 text-xs text-gray-400 mb-6">
                            <span className="flex items-center gap-1"><Bus className="w-4 h-4" /> Bus Tickets</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Travel Plans</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Armchair className="w-4 h-4" /> Seat Info</span>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-2 text-sm">How to track your booking</h3>
                            <div className="space-y-2 text-left text-xs text-gray-500">
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                    <span>Enter the <strong>phone number or ticket number</strong> from your booking</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                    <span>All your <strong>confirmed bookings</strong> will appear below</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                                    <span>Contact us at <strong>9856068470</strong> for any assistance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
