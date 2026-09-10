'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bus, Phone, Mail, MapPin, Calendar, Receipt, Clock, Printer, Download, Home, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function TicketClient({ booking }: { booking: any }) {
    const router = useRouter();
    const ticketRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.print();
    };

    const methodLabel: Record<string, string> = {
        esewa: 'eSewa',
        khalti: 'Khalti',
        khalti_mobilebanking: 'Mobile Banking',
        cash_on_bus: 'Cash on Bus',
        external_portal: 'External Booking',
        counter_booking: 'Counter Booking',
        paco: 'Visa / Mastercard',
        visa: 'Visa / Mastercard'
    };

    const methodColor: Record<string, string> = {
        esewa: 'text-green-600',
        khalti: 'text-purple-600',
        khalti_mobilebanking: 'text-blue-600',
        cash_on_bus: 'text-amber-600',
        external_portal: 'text-gray-600',
        counter_booking: 'text-indigo-600',
        paco: 'text-blue-600',
        visa: 'text-blue-600',
    };

    const source = booking?.schedule?.route?.origin || booking?.route?.origin || '—';
    const destination = booking?.schedule?.route?.destination || booking?.route?.destination || '—';
    const travelDate = booking?.schedule?.departureTime ? dayjs(booking.schedule.departureTime).format('YYYY-MM-DD') : '—';
    const departureTime = booking?.schedule?.departureTime ? dayjs(booking.schedule.departureTime).format('HH:mm') : booking?.departureTime || '—';
    
    const passengerName = booking.customerName || booking.passengerName || '—';
    const passengerPhone = booking.contactPhone || '—';
    const passengerEmail = booking.contactEmail || '—';

    const seatNumbers = booking.seats ? booking.seats.map((s: any) => s.seatNumber) : [];
    const method = booking.payment?.gateway || 'cash_on_bus';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 pt-[72px] pb-24 font-sans">

            {/* Action Buttons — hidden on print */}
            <div className="print:hidden max-w-lg mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                    <Home className="w-4 h-4" /> Home
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-bold py-2.5 px-5 rounded-xl text-sm shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-orange-200 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" /> Download
                    </button>
                </div>
            </div>

            {/* TICKET CARD */}
            <div ref={ticketRef} className="max-w-lg mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 relative">

                    {/* Header Band */}
                    <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-6 py-6 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 translate-y-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg border border-white/30 bg-white flex items-center justify-center font-bold text-orange-600 text-xs">BUS</div>
                                    <span className="text-sm font-bold tracking-wide uppercase opacity-90">Chitwan Bus</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{booking.status || 'CONFIRMED'}</span>
                                </div>
                            </div>

                            {/* Route Display */}
                            <div className="flex items-center gap-4 mt-5">
                                <div className="flex-1">
                                    <p className="text-white/60 text-xs font-medium mb-0.5">FROM</p>
                                    <p className="text-xl font-bold leading-tight">{source}</p>
                                </div>
                                <div className="flex flex-col items-center gap-0.5 pt-3">
                                    <Bus className="w-5 h-5 text-white/80" />
                                    <div className="w-12 h-[1px] bg-white/30" />
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-white/60 text-xs font-medium mb-0.5">TO</p>
                                    <p className="text-xl font-bold leading-tight">{destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="px-6 py-6 space-y-5">
                        {/* PNR */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-0.5">PNR / Booking Ref</p>
                                <p className="text-2xl font-mono font-black text-gray-900 tracking-wider">{booking.pnr || booking.bookingRef || '—'}</p>
                            </div>
                            <Receipt className="w-8 h-8 text-orange-300" />
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Passenger</p>
                                <p className="text-sm font-bold text-gray-900">{passengerName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Seat(s)</p>
                                <p className="text-sm font-bold text-gray-900">{seatNumbers.join(', ') || '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Date</p>
                                <p className="text-sm font-bold text-gray-900">{travelDate}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Departure</p>
                                <p className="text-sm font-bold text-gray-900">{departureTime}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Phone</p>
                                <p className="text-sm font-bold text-gray-900">{passengerPhone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment</p>
                                <p className={`text-sm font-bold ${methodColor[method] || 'text-gray-900'}`}>
                                    {methodLabel[method] || method}
                                </p>
                            </div>
                        </div>

                        {/* Boarding/Drop Info */}
                        {(booking.boardingPoint || booking.droppingPoint) && (
                            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                                {booking.boardingPoint && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Boarding</p>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-orange-500" /> {booking.boardingPoint}
                                        </p>
                                    </div>
                                )}
                                {booking.droppingPoint && (
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Dropping</p>
                                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-orange-500" /> {booking.droppingPoint}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="relative border-t border-dashed border-gray-300 bg-gray-50 px-6 py-5">
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-slate-100 to-blue-50 rounded-full"></div>
                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-slate-100 to-blue-50 rounded-full"></div>
                        
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">Total Paid</p>
                                <p className="text-2xl font-black text-gray-900">NPR {booking.totalFare || '—'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Thank you for booking</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Have a safe journey!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
