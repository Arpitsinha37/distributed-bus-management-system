import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaBus, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaChair, FaReceipt, FaClock, FaPrint, FaDownload, FaHome, FaCheckCircle } from 'react-icons/fa';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';

const Ticket = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ticketRef = useRef(null);

    const ticketNo = searchParams.get('ticketNo') || searchParams.get('id');
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ticketNo) {
            navigate('/', { replace: true });
            return;
        }

        const fetchTicket = async (retriesLeft = 8) => {
            try {
                const data = await api.payments.getByTicketNo(ticketNo);
                setTicket(data);
                setLoading(false);
            } catch (err) {
                if (retriesLeft > 0) {
                    // On first failure, also try bus portal in parallel immediately
                    if (retriesLeft === 8) {
                        tryBusPortal();
                    }
                    console.log(`Ticket not ready yet, retrying in 2.5s... (${retriesLeft} retries left)`);
                    setTimeout(() => fetchTicket(retriesLeft - 1), 2500);
                    return;
                }

                // ALL retries exhausted — if busPortal hasn't resolved yet, try one more time
                if (!ticket) {
                    await tryBusPortal();
                }

                if (!ticket) {
                    console.error('Failed to fetch ticket after all retries:', err);
                    setError('Ticket not found. Please verify your Ticket/PNR Number.');
                    setLoading(false);
                }
            }
        };

        const tryBusPortal = async () => {
            try {
                const pData = await api.busPortal.getPassenger(ticketNo);
                if (pData && pData.data && pData.data !== 'Data not found' && pData.code !== '2') {
                    const info = typeof pData.data === 'object' ? pData.data : {};
                    const pickupRaw = info.Pickup || info.pickup || '';
                    // Extract time from pickup like "Sorhakhutte(07:00 AM)"
                    const timeMatch = pickupRaw.match(/\(([^)]+)\)/);
                    const departureTime = timeMatch ? timeMatch[1] : '';
                    const pickupPoint = pickupRaw.replace(/\([^)]*\)/, '').trim();

                    setTicket({
                        ticketNo: info.TicketNo || ticketNo,
                        method: 'counter_booking',
                        amount: info.Daar || info.daar || info.amount || info.price || info.Totalamount || '---',
                        currency: 'NPR',
                        status: 'completed',
                        passengerName: info.Name || info.name || 'Passenger',
                        passengerPhone: info.Contactno || info.contactno || info.Contact || info.contact || '---',
                        passengerEmail: info.Email || info.email || '',
                        route: `${info.From1 || info.from1 || info.From || info.from_location || ''} → ${info.To1 || info.to1 || info.To || info.to_location || ''}`.trim() || 'Bus Route',
                        travelDate: info.Date || info.date || '---',
                        seatNumbers: info.Seatno ? String(info.Seatno).split(',').map(s => s.trim()) : (info.seatno ? String(info.seatno).split(',').map(s => s.trim()) : (info.Seat ? String(info.Seat).split(',') : [])),
                        pickupPoint: pickupPoint || '',
                        dropPoint: (info.Drop1 || info.drop1 || info.Drop || '').trim() || '',
                        departureTime: departureTime || '',
                    });
                    setLoading(false);
                    return;
                }
            } catch (portalErr) {
                console.error('Portal fallback error:', portalErr);
            }
        };


        fetchTicket();
    }, [ticketNo, navigate]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Use the browser's print-to-PDF as download
        window.print();
    };

    const methodLabel = {
        esewa: 'eSewa',
        khalti: 'Khalti',
        khalti_mobilebanking: 'Mobile Banking',
        cash_on_bus: 'Cash on Bus',
        external_portal: 'External Booking',
        counter_booking: 'Counter Booking',
    };

    const methodColor = {
        esewa: 'text-green-600',
        khalti: 'text-purple-600',
        khalti_mobilebanking: 'text-blue-600',
        cash_on_bus: 'text-amber-600',
        external_portal: 'text-gray-600',
        counter_booking: 'text-indigo-600',
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 pt-[72px]">
                <SEOHead title="Loading Ticket" description="Loading your bus ticket..." noIndex={true} />
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full p-10 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                        <div className="w-full h-full rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Your Ticket</h2>
                    <p className="text-sm text-gray-500">Fetching booking details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8 pt-[72px]">
                <SEOHead title="Ticket Not Found" description="Could not find your ticket" noIndex={true} />
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Ticket Not Found</h2>
                    <p className="text-sm text-gray-500 mb-6">{error || 'No ticket data available'}</p>
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    const routeParts = ticket.route ? ticket.route.split('→').map(s => s.trim()) : ['—', '—'];
    const source = routeParts[0] || '—';
    const destination = routeParts[1] || '—';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 pt-[72px] pb-24">
            <SEOHead
                title={`Bus Ticket — ${ticket.ticketNo}`}
                description="Your confirmed bus ticket from New Road Travels"
                noIndex={true}
            />

            {/* Action Buttons — hidden on print */}
            <div className="print:hidden max-w-lg mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                    <FaHome /> Home
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-bold py-2.5 px-5 rounded-xl text-sm shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                        <FaPrint /> Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md shadow-blue-200 transition-all active:scale-95"
                    >
                        <FaDownload /> Download
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
                                    <img src="/nrt-logo.png" alt="New Road Travels" className="w-10 h-10 rounded-lg border border-white/30" />
                                    <span className="text-sm font-bold tracking-wide uppercase opacity-90">New Road Travels</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <FaCheckCircle className="text-emerald-300 text-xs" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Confirmed</span>
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
                                            <FaBus className="text-[#EF4F5F] text-xs bg-white px-1" />
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
                                    <FaCalendarAlt className="text-blue-500 text-xs" />
                                    <span className="text-[10px] text-blue-500 uppercase tracking-wider font-bold">Travel Date</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">{ticket.travelDate || '—'}</p>
                            </div>
                            <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100/50">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <FaChair className="text-emerald-500 text-xs" />
                                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Seat(s)</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                    {ticket.seatNumbers?.length > 0 ? ticket.seatNumbers.join(', ') : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Row 1b: Pickup & Departure (for counter/manual bookings) */}
                        {(ticket.pickupPoint || ticket.departureTime) && (
                            <div className="grid grid-cols-2 gap-4">
                                {ticket.pickupPoint && (
                                    <div className="bg-orange-50/60 rounded-xl p-3.5 border border-orange-100/50">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <FaMapMarkerAlt className="text-orange-500 text-xs" />
                                            <span className="text-[10px] text-orange-500 uppercase tracking-wider font-bold">Pickup Point</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{ticket.pickupPoint}</p>
                                    </div>
                                )}
                                {ticket.departureTime && (
                                    <div className="bg-violet-50/60 rounded-xl p-3.5 border border-violet-100/50">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <FaClock className="text-violet-500 text-xs" />
                                            <span className="text-[10px] text-violet-500 uppercase tracking-wider font-bold">Departure</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{ticket.departureTime}</p>
                                    </div>
                                )}
                            </div>
                        )}

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
                                    <p className="text-sm font-bold text-gray-900">{ticket.passengerName || '—'}</p>
                                </div>
                            </div>

                            {ticket.passengerPhone && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FaPhone className="text-gray-500 text-xs" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Contact</p>
                                        <p className="text-sm font-bold text-gray-900">{ticket.passengerPhone}</p>
                                    </div>
                                </div>
                            )}

                            {ticket.passengerEmail && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FaEnvelope className="text-gray-500 text-xs" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Email</p>
                                        <p className="text-sm font-bold text-gray-900">{ticket.passengerEmail}</p>
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
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Ticket No</span>
                                <span className="font-mono font-bold text-gray-900 text-sm bg-gray-50 px-3 py-1 rounded-lg">{ticket.ticketNo}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payment Method</span>
                                <span className={`font-bold text-sm flex items-center gap-1.5 ${methodColor[ticket.method] || 'text-gray-800'}`}>
                                    <span className="w-2 h-2 bg-current rounded-full" />
                                    {methodLabel[ticket.method] || ticket.method}
                                </span>
                            </div>
                            {ticket.transactionId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Transaction ID</span>
                                    <span className="font-mono text-gray-600 text-xs">{ticket.transactionId.length > 24 ? ticket.transactionId.slice(0, 24) + '...' : ticket.transactionId}</span>
                                </div>
                            )}
                            {ticket.discountAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Discount</span>
                                    <span className="text-sm font-bold text-green-600">- रू {ticket.discountAmount}</span>
                                </div>
                            )}
                        </div>

                        {/* ── Total Amount ── */}
                        <div className="mt-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Total Paid</p>
                                <p className="text-2xl font-bold text-white">रू {ticket.amount}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <FaReceipt className="text-white/80 text-lg" />
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
                            NRT-{ticket.ticketNo} • {ticket.travelDate || 'N/A'}
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
                            <FaClock className="text-amber-500 text-xs" />
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

                {/* ── Back to Home button ── */}
                <div className="mt-4 print:hidden">
                    <button
                        onClick={() => navigate('/', { replace: true })}
                        className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        ← Back to Homepage
                    </button>
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
};

export default Ticket;


