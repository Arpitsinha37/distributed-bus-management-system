"use client";
import React from 'react';
import Image from 'next/image';

const SEAT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbVQdNAgwhTLxz3xjcbcF5pQDIMEB9I4cUArYHlBCGUVTUcVQ8HUpMcE_CCJUSfsQO6stsOZaramXwO10xvPWXSM04i54Aakvg46-gdKcW3FxBm0snmH_AVhx2rW6n2KlkzKiN-toSlAmac4JKVqFCB_qiqKAydz-a2jEcETICx1ipm376CJ5bMkRx7-ZB4NOEkW9KVDMSAal2yJT2tQAo8HHtgZYxUlWoH1GMb2ydwgE4OiTH3vMuB8auqW41wcGEKQKKPfbEG6Q';

export default function SeatMap({ seats, selectedSeats, onSeatClick, price, noofcolumn = 5 }: any) {
    if (!seats || seats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: '#75777e' }}>
                <svg className="w-12 h-12 mb-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <circle cx="7" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="17" cy="12" r="1.5" />
                </svg>
                <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Loading seat layout...</span>
            </div>
        );
    }

    const getSeatStatus = (seat: any) => {
        if (seat.bookingStatus === 'na' || seat.displayName === 'na') return 'SPACE';
        if (selectedSeats.includes(seat.displayName)) return 'SELECTED';
        if (seat.bookingStatus === 'No') {
            return seat.gender === 'female' ? 'BOOKED_FEMALE' : 'BOOKED_MALE';
        }
        if (seat.bookingStatus === 'Yes') return 'AVAILABLE';
        return 'UNKNOWN';
    };

    // Group seats into rows
    const rows = [];
    for (let i = 0; i < seats.length; i += noofcolumn) {
        rows.push(seats.slice(i, i + noofcolumn));
    }

    return (
        <div className="w-full max-w-[420px] mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Bus Frame */}
            <div className="rounded-2xl border shadow-sm relative overflow-hidden" style={{ background: '#fcf9f8', borderColor: '#e5e2e1' }}>
                
                {/* Subtle silk texture */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 100%)', opacity: 0.5 }} />
                
                {/* Steering Row */}
                <div className="flex items-center justify-end px-8 py-5 border-b relative z-10" style={{ borderColor: '#e5e2e1' }}>
                    <svg className="w-8 h-8 opacity-40" style={{ color: '#1c1b1b' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="3.5" />
                        <path d="M12 3v5.5M3 12h5.5M12 21v-5.5M21 12h-5.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Seat Grid */}
                <div className="px-5 py-6 relative z-10">
                    <div className="space-y-4">
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex items-center justify-center gap-3">
                                {row.map((seat, colIndex) => {
                                    const status = getSeatStatus(seat);

                                    if (status === 'SPACE') {
                                        return <div key={colIndex} className="w-[56px] h-[64px]" />;
                                    }

                                    const isBooked = status === 'BOOKED_MALE' || status === 'BOOKED_FEMALE';
                                    const isSelected = status === 'SELECTED';
                                    const isAvailable = status === 'AVAILABLE';

                                    // Minimalist Box Styling
                                    let containerClass = "group relative w-[56px] h-[64px] flex flex-col items-center justify-end pb-1 transition-all duration-200 rounded-xl ";
                                    let imgClass = "absolute top-1 w-[44px] h-[44px] object-contain transition-all duration-200 ";
                                    
                                    if (isSelected) {
                                        containerClass += "bg-[#fff1f0] border-2 border-[#b1002c] shadow-sm z-10 scale-105";
                                        imgClass += "opacity-100";
                                    } else if (isBooked) {
                                        containerClass += "bg-gray-50/50 border border-gray-200 cursor-not-allowed";
                                        imgClass += "opacity-20 grayscale";
                                    } else {
                                        // Available (Green)
                                        containerClass += "bg-[#ecfdf5] border-2 border-[#10b981] cursor-pointer hover:bg-[#d1fae5] hover:scale-105";
                                        imgClass += "opacity-40 grayscale group-hover:opacity-60";
                                    }

                                    return (
                                        <button
                                            key={colIndex}
                                            onClick={() => (isAvailable || isSelected) && onSeatClick(seat)}
                                            disabled={isBooked}
                                            title={isBooked ? `Seat ${seat.displayName} (Booked)` : `Seat ${seat.displayName} — रू${price}`}
                                            className={containerClass}
                                        >
                                            <img
                                                alt={`Seat ${seat.displayName}`}
                                                className={imgClass}
                                                src={SEAT_IMG}
                                                width={44}
                                                height={44}
                                                unoptimized
                                            />

                                            {isBooked && (
                                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">
                                                    ✕
                                                </span>
                                            )}

                                            {isSelected ? (
                                                <span className="relative z-10 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#b1002c] text-white shadow-sm mt-8">
                                                    {seat.displayName}
                                                </span>
                                            ) : isAvailable ? (
                                                <span className="relative z-10 text-[11px] font-semibold text-[#16a34a] mt-8">
                                                    {seat.displayName}
                                                </span>
                                            ) : (
                                                <span className="relative z-10 text-[11px] font-medium text-gray-400 mt-8">
                                                    {seat.displayName}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-5 rounded-xl border p-5" style={{ background: '#fcf9f8', borderColor: '#e5e2e1' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#1c1b1b' }}>Seat Guide</h4>
                <div className="flex gap-4 items-center justify-between">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] border-2 border-[#10b981] flex items-center justify-center relative">
                            <img alt="Available" className="w-8 h-8 object-contain opacity-40 grayscale" src={SEAT_IMG} width={32} height={32} />
                        </div>
                        <span className="text-[11px] font-medium text-gray-600">Available</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-[#fff1f0] border-2 border-[#b1002c] shadow-sm flex items-center justify-center relative">
                            <img alt="Selected" className="w-8 h-8 object-contain" src={SEAT_IMG} width={32} height={32} />
                        </div>
                        <span className="text-[11px] font-medium text-gray-600">Selected</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center relative">
                            <img alt="Occupied" className="w-8 h-8 object-contain opacity-20 grayscale" src={SEAT_IMG} width={32} height={32} />
                            <span className="absolute text-lg font-bold text-gray-300">✕</span>
                        </div>
                        <span className="text-[11px] font-medium text-gray-600">Reserved</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
