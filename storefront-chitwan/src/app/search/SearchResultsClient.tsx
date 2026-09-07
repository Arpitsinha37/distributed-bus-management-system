"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Bus, Clock, Users, Filter, ArrowUpDown, MapPin, Calendar, Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import Link from 'next/link';

// Helper to format date
const formatDateStr = (d: string | undefined | null) => {
    if (!d) return '';
    try {
        const dateObj = new Date(d);
        return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return d; }
};

export default function SearchResultsClient({ 
    initialTrips, 
    source, 
    destination, 
    date 
}: { 
    initialTrips: any[], 
    source?: string, 
    destination?: string, 
    date?: string 
}) {
    const [buses, setBuses] = useState(initialTrips || []);
    const [sortBy, setSortBy] = useState('price_low');
    const [showSortMenu, setShowSortMenu] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Update buses if initialTrips changes
    useEffect(() => {
        setBuses(initialTrips || []);
    }, [initialTrips]);

    // --- Date Slider Logic ---
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0,0,0,0);
        return d;
    }, []);

    const selectedDateObj = useMemo(() => {
        if (!date) return today;
        try {
            const parsed = parseISO(date);
            parsed.setHours(0,0,0,0);
            return parsed;
        } catch (e) {
            return today;
        }
    }, [date, today]);

    const allDates = useMemo(() => {
        const dates = [];
        const start = new Date(today);
        for (let i = 0; i < 30; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [today]);

    useEffect(() => {
        if (scrollContainerRef.current && selectedDateObj) {
            const index = allDates.findIndex(d => isSameDay(d, selectedDateObj));
            if (index > -1) {
                const buttonWidth = 110;
                const containerWidth = scrollContainerRef.current.clientWidth;
                const scrollPos = (index * buttonWidth) - (containerWidth / 2) + (buttonWidth / 2);
                scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
            }
        }
    }, [selectedDateObj, allDates]);

    const handleDateClick = (newDate: Date) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', format(newDate, 'yyyy-MM-dd'));
        router.push(`/search?${params.toString()}`);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };
    
    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };
    // -------------------------

    // Sort buses
    const sortedBuses = useMemo(() => {
        const sorted = Array.isArray(buses) ? [...buses] : [];
        switch (sortBy) {
            case 'price_low': return sorted.sort((a, b) => (Number(a.fare) || 0) - (Number(b.fare) || 0));
            case 'price_high': return sorted.sort((a, b) => (Number(b.fare) || 0) - (Number(a.fare) || 0));
            case 'departure': return sorted.sort((a, b) => String(a.departureTime || '').localeCompare(String(b.departureTime || '')));
            case 'seats': return sorted.sort((a, b) => (Number(b.availableSeats) || 0) - (Number(a.availableSeats) || 0));
            default: return sorted;
        }
    }, [buses, sortBy]);

    const handleViewSeats = (trip: any) => {
        router.push(`/book/${trip.tripId}`);
    };

    const sortOptions = [
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'departure', label: 'Earliest Departure' },
        { value: 'seats', label: 'Most Seats Available' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            {/* Route Summary Bar */}
            <div className="bg-white border-b border-slate-100 sticky top-0 sm:top-0 z-30">
                <div className="max-w-screen-xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-slate-900">
                            <MapPin className="w-4 h-4 text-[#DC143C] shrink-0" />
                            <span className="font-bold text-sm sm:text-base">{source || '—'}</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-sm sm:text-base">{destination || '—'}</span>
                        </div>
                        <div className="hidden sm:block w-px h-5 bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-medium">{formatDateStr(date)}</span>
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-[#DC143C] font-semibold text-sm hover:underline shrink-0"
                    >
                        <Search className="w-3.5 h-3.5" />
                        Modify Search
                    </Link>
                </div>
            </div>

            {/* Date Slider */}
            <div className="bg-white shadow-[0_4px_10px_rgb(0,0,0,0.03)] border-b border-slate-200 sticky top-[56px] sm:top-[68px] z-20">
                <div className="max-w-screen-xl mx-auto flex items-center relative">
                    <button 
                        onClick={scrollLeft}
                        className="absolute left-0 z-10 h-full px-2 sm:px-4 bg-gradient-to-r from-white via-white/90 to-transparent text-[#2196F3] hover:text-blue-700 transition-colors hidden sm:flex items-center justify-center"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div 
                        ref={scrollContainerRef}
                        className="flex-1 flex items-center overflow-x-auto gap-1 sm:gap-2 px-4 sm:px-12 py-2 sm:py-3 scroll-smooth [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {allDates.map((d, i) => {
                            const isSelected = isSameDay(d, selectedDateObj);
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleDateClick(d)}
                                    className={`
                                        flex-shrink-0 px-4 py-2 sm:py-2.5 rounded-xl text-sm transition-all whitespace-nowrap border-2
                                        ${isSelected 
                                            ? 'bg-[#eef6ff] text-[#2196F3] border-[#eef6ff] font-bold shadow-sm' 
                                            : 'text-slate-600 border-transparent hover:border-slate-100 hover:bg-slate-50 font-semibold'
                                        }
                                    `}
                                >
                                    {format(d, 'dd MMM, EEE')}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={scrollRight}
                        className="absolute right-0 z-10 h-full px-2 sm:px-4 bg-gradient-to-l from-white via-white/90 to-transparent text-[#2196F3] hover:text-blue-700 transition-colors hidden sm:flex items-center justify-center"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 py-5 sm:py-8">

                {/* Results Header with Sort */}
                {buses.length > 0 && (
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                {buses.length} Bus{buses.length !== 1 ? 'es' : ''} Found
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                {source} to {destination}
                            </p>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 transition-all shadow-sm"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                                <span className="hidden sm:inline">Sort by:</span>
                                <span className="font-semibold text-slate-900">{sortOptions.find(o => o.value === sortBy)?.label?.split(': ')[1] || 'Price'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                            </button>
                            {showSortMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option.value
                                                    ? 'text-[#DC143C] bg-red-50 font-semibold'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {buses.length === 0 && (
                    <div className="text-center py-16 sm:py-24">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <Bus className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No Buses Available</h2>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
                            No buses found for {source} to {destination} on {formatDateStr(date)}. Try different dates or routes.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-[#DC143C] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-red-500/20"
                        >
                            <Search className="w-4 h-4" />
                            Search Again
                        </Link>
                    </div>
                )}

                {/* Bus Result Cards */}
                <div className="space-y-3 sm:space-y-4">
                    {sortedBuses.map((bus) => (
                        <div
                            key={bus.tripId}
                            className="bg-white rounded-2xl border border-slate-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                                    {/* Left: Bus Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Company & Tags */}
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                                {bus.bus?.operator || 'Bus Operator'}
                                            </h3>
                                            {/* Assuming all are tourist buses for now or modify based on data */}
                                            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                                ✦ Tourist
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3 font-medium">{bus.bus?.type}</p>

                                        {/* Route Timeline */}
                                        <div className="flex items-center gap-3 sm:gap-4 mb-3">
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{bus.departureTime}</p>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{bus.route?.origin}</p>
                                            </div>

                                            {/* Route Line */}
                                            <div className="flex-1 flex items-center gap-1 px-1">
                                                <div className="w-2 h-2 rounded-full bg-[#DC143C] shrink-0" />
                                                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#DC143C] to-slate-300 relative">
                                                    <Bus className="w-4 h-4 text-[#DC143C] absolute -top-[7px] left-1/2 -translate-x-1/2" />
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                            </div>

                                            <div className="text-center min-w-[60px]">
                                                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                                                    {/* Approximation of arrival time */}
                                                    {format(new Date(new Date(`${date}T${bus.departureTime}`).getTime() + 6 * 60 * 60 * 1000), 'HH:mm')}
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{bus.route?.destination}</p>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        {bus.bus?.amenities && Array.isArray(bus.bus.amenities) && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {bus.bus.amenities.slice(0, 5).map((a: string, i: number) => (
                                                    <span key={i} className="bg-slate-50 text-slate-600 text-[10px] sm:text-[11px] px-2 py-1 rounded-md font-medium border border-slate-100">
                                                        {a.trim()}
                                                    </span>
                                                ))}
                                                {bus.bus.amenities.length > 5 && (
                                                    <span className="text-[10px] text-slate-400 px-1 py-1 font-medium">
                                                        +{bus.bus.amenities.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Price + Action */}
                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2 min-w-[140px] pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                                        <div className="text-left md:text-right">
                                            <span className="text-2xl sm:text-3xl font-black text-[#DC143C]">
                                                रू {bus.fare}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 md:justify-end">
                                                <Users className="w-3 h-3" />
                                                <span>{bus.availableSeats} seats</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleViewSeats(bus)}
                                            className="bg-[#DC143C] hover:bg-red-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl text-sm transition-all shadow-md shadow-red-500/20 hover:shadow-lg active:scale-[0.97] whitespace-nowrap"
                                        >
                                            View Seats →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
