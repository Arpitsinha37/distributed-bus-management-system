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

    const source = booking?.schedule?.route?.origin || '—';
    const destination = booking?.schedule?.route?.destination || '—';
    const travelDate = booking?.schedule?.departureTime ? dayjs(booking.schedule.departureTime).format('YYYY-MM-DD') : '—';
    const departureTime = booking?.schedule?.departureTime ? dayjs(booking.schedule.departureTime).format('HH:mm') : '—';
    
    // In our new schema, customer name is stored in booking.customerName.
    const passengerName = booking.customerName || '—';
    const passengerPhone = booking.contactPhone || '—';
    const passengerEmail = booking.contactEmail || '—';

    // seats is an array of objects
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
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-blue-200 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" /> Download
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* TICKET CARD */}
            {/* ═══════════════════════════════════════ */}
            <div ref={ticketRef} className="max-w-lg mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 relative">

                    {/* ── Header Band ── */}
                    <div className="bg-gradient-to-r from-[#EF4F5F] via-[#E8364A] to-[#D92A3E] px-6 py-6 text-white relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full -translate-x-16 -translate-y-16" />
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 translate-y-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg border border-white/30 bg-white flex items-center justify-center font-bold text-[#EF4F5F]">NRT</div>
                                    <span className="text-sm font-bold tracking-wide uppercase opacity-90">New Road Travels</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <CheckCircle className="text-emerald-300 w-3 h-3" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{booking.status || 'Confirmed'}</span>
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Bus Ticket</h1>
                            <p className="text-white/80 text-xs mt-1">Digital Boarding Pass • Keep this for your records</p>
                        </div>
                    </div>

                    {/* ── Route Section ── */}
                    <div className="px-6 py-5 bg-gradient-to-b from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">From</p>
                                <p className="text-lg font-bold text-gray-900 leading-tight">{source}</p>
                            </div>

                            <div className="flex-shrink-0 px-4 flex flex-col items-center gap-1">
                                <div className="relative flex items-center w-24">
                                    <div className="w-3 h-3 bg-[#EF4F5F] rounded-full border-2 border-white shadow-sm z-10" />
                                    <div className="flex-1 h-[2px] bg-gradient-to-r from-[#EF4F5F] to-[#EF4F5F]/30 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Bus className="text-[#EF4F5F] w-3 h-3 bg-white px-0.5" />
                                        </div>
                                    </div>
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10" />
                                </div>
                            </div>

                            <div className="text-center flex-1">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">To</p>
                                <p className="text-lg font-bold text-gray-900 leading-tight">{destination}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Perforated Divider ── */}
                    <div className="relative">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 rounded-full" />
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 rounded-full" />
                        <div className="border-t-2 border-dashed border-gray-200 mx-8" />
                    </div>

                    {/* ── Ticket Details Grid ── */}
                    <div className="px-6 py-5 space-y-4">
                        {/* Row 1: Date & Seats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100/50">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Calendar className="text-blue-500 w-3 h-3" />
                                    <span className="text-[10px] text-blue-500 uppercase tracking-wider font-bold">Travel Date</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{travelDate}</p>
                            </div>
                            <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100/50">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Bus className="text-emerald-500 w-3 h-3" />
                                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Seat(s)</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                    {seatNumbers.length > 0 ? seatNumbers.join(', ') : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Row 1b: Pickup & Departure */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50/60 rounded-xl p-3.5 border border-orange-100/50">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <MapPin className="text-orange-500 w-3 h-3" />
                                    <span className="text-[10px] text-orange-500 uppercase tracking-wider font-bold">Pickup Point</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{booking.boardingPoint || '—'}</p>
                            </div>
                            <div className="bg-violet-50/60 rounded-xl p-3.5 border border-violet-100/50">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Clock className="text-violet-500 w-3 h-3" />
                                    <span className="text-[10px] text-violet-500 uppercase tracking-wider font-bold">Departure</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{departureTime}</p>
                            </div>
                        </div>

                        {/* Row 2: Passenger & Contact */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Passenger</p>
                                    <p className="text-sm font-bold text-gray-900">{passengerName}</p>
                                </div>
                            </div>

                            {passengerPhone && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Phone className="text-gray-500 w-3 h-3" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Contact</p>
                                        <p className="text-sm font-bold text-gray-900">{passengerPhone}</p>
                                    </div>
                                </div>
                            )}

                            {passengerEmail && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Mail className="text-gray-500 w-3 h-3" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Email</p>
                                        <p className="text-sm font-bold text-gray-900">{passengerEmail}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Second Perforated Divider ── */}
                    <div className="relative">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 rounded-full" />
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 rounded-full" />
                        <div className="border-t-2 border-dashed border-gray-200 mx-8" />
                    </div>

                    {/* ── Payment & Ticket Info ── */}
                    <div className="px-6 py-5">
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Booking Ref</span>
                                <span className="font-mono font-bold text-gray-900 text-sm bg-gray-50 px-3 py-1 rounded-lg">{booking.pnr || booking.bookingRef}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payment Method</span>
                                <span className={`font-bold text-sm flex items-center gap-1.5 ${methodColor[method] || 'text-gray-800'}`}>
                                    <span className="w-2 h-2 bg-current rounded-full" />
                                    {methodLabel[method] || method}
                                </span>
                            </div>
                        </div>

                        {/* ── Total Amount ── */}
                        <div className="mt-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Total Paid</p>
                                <p className="text-2xl font-bold text-white">रू {booking.totalFare}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Receipt className="text-white/80 w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* ── Footer (barcode-like visual) ── */}
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                        {/* Visual ticket barcode */}
                        <div className="flex items-center justify-center gap-[2px] mb-3 opacity-30">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-900"
                                    style={{
                                        width: Math.random() > 0.5 ? '3px' : '1.5px',
                                        height: `${20 + Math.random() * 10}px`,
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-center text-[10px] text-gray-400 tracking-wide">
                            NRT-{booking.pnr || booking.bookingRef} • {travelDate || 'N/A'}
                        </p>
                        <p className="text-center text-[9px] text-gray-300 mt-1">
                            Please show this ticket at the boarding point • newroadtravels.com
                        </p>
                    </div>
                </div>

                {/* ── Important Note ── */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 print:hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="text-amber-500 w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">Important Information</p>
                            <ul className="text-xs text-amber-700 space-y-1.5">
                                <li>• Please arrive at the boarding point <strong>15 minutes</strong> before departure.</li>
                                <li>• Carry a valid government ID for verification.</li>
                                <li>• This digital ticket is your boarding pass.</li>
                                <li>• For help, contact: <strong>9856068470</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Print Styles ── */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    header, footer, nav { display: none !important; }
                    main { padding: 0 !important; }
                }
            `}</style>
        </div>
    );
}
