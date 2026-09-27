'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Download, Home, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { AnimatedTicket } from '@/components/ui/ticket-confirmation-card';

export default function TicketClient({ booking }: { booking: any }) {
    const router = useRouter();
    const ticketRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.print();
    };

    const source = booking.portalRoute?.origin || booking?.schedule?.route?.originCity || booking?.schedule?.route?.origin || '—';
    const destination = booking.portalRoute?.destination || booking?.schedule?.route?.destinationCity || booking?.schedule?.route?.destination || '—';
    
    // Attempt to construct a Date object for the travel date and time
    const travelDateStr = booking.portalRoute?.date || (booking?.schedule?.departureTime ? dayjs(booking.schedule.departureTime).format('YYYY-MM-DD') : (booking?.trip?.travelDate ? dayjs(booking.trip.travelDate).format('YYYY-MM-DD') : ''));
    const departureTimeStr = booking.portalRoute?.time || booking.trip?.schedule?.departureTime || booking?.schedule?.departureTime ? dayjs(booking.schedule?.departureTime || booking.trip?.schedule?.departureTime).format('HH:mm') : '07:00';
    
    // Default to current date if missing
    let combinedDate = new Date();
    if (travelDateStr) {
        // Simple string parsing to keep the date valid
        combinedDate = new Date(`${travelDateStr}T${departureTimeStr.includes('M') ? '07:00:00' : (departureTimeStr + ':00')}`);
        if (isNaN(combinedDate.getTime())) {
            combinedDate = new Date(); // fallback
        }
    }

    const passengerName = booking.customerName || 'Passenger';
    const seatNumbers = booking.seats ? booking.seats.map((s: any) => s.seatNumber) : [];
    const pnr = booking.pnr || booking.bookingRef || 'NRT-TICKET';

    return (
        <div className="min-h-screen bg-slate-50 pt-[72px] pb-24 font-sans">
            {/* Action Buttons — hidden on print */}
            <div className="print:hidden max-w-sm mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                    <Home className="w-4 h-4" /> Home
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 font-bold py-2 px-4 rounded-xl text-sm shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>

            {/* Ticket Card Component */}
            <div className="flex justify-center px-4">
                <AnimatedTicket
                    ref={ticketRef}
                    pnr={pnr}
                    amount={Number(booking.totalFare || 0)}
                    date={combinedDate}
                    passengerName={passengerName}
                    route={`${source} to ${destination}`}
                    seats={seatNumbers.length > 0 ? seatNumbers.join(', ') : 'TBD'}
                    barcodeValue={pnr}
                />
            </div>

            {/* Important Note */}
            <div className="max-w-sm mx-auto mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 print:hidden mx-4">
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

            {/* Print Styles */}
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
