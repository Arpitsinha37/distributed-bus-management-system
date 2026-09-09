import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Bus, Clock, Users, Filter, ArrowUpDown, MapPin, Calendar, Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';

// Loading Skeleton
const BusSkeleton = () => (
    <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-36 h-5 bg-slate-200 rounded-lg" />
                    <div className="w-16 h-5 bg-green-100 rounded" />
                </div>
                <div className="w-24 h-4 bg-slate-100 rounded" />
                <div className="flex items-center gap-4 mt-3">
                    <div className="w-16 h-6 bg-slate-200 rounded" />
                    <div className="w-8 h-3 bg-slate-100 rounded-full" />
                    <div className="w-16 h-6 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2 mt-2">
                    <div className="w-14 h-5 bg-slate-100 rounded-full" />
                    <div className="w-14 h-5 bg-slate-100 rounded-full" />
                    <div className="w-14 h-5 bg-slate-100 rounded-full" />
                </div>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[130px]">
                <div className="w-24 h-7 bg-slate-200 rounded" />
                <div className="w-16 h-4 bg-slate-100 rounded" />
                <div className="w-28 h-10 bg-red-100 rounded-xl mt-1" />
            </div>
        </div>
    </div>
);

const SearchResults = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('price_low');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');

    const fetchBuses = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.busPortal.searchTrips(source, destination, date);
            if (result.code === '1' && result.data) {
                // Ensure data is always an array
                const dataArray = Array.isArray(result.data) 
                    ? result.data 
                    : (typeof result.data === 'object' ? Object.values(result.data) : []);
                setBuses(dataArray);
            } else {
                setError(result.message || 'No trips found for this route.');
            }
        } catch (err) {
            console.error(err);
            if (err?.message?.includes('Data not found')) {
                setBuses([]);
                setError(null); // Clear error so the empty state UI shows
            } else if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
                setError('Server is temporarily unavailable. Please try again in a moment.');
            } else {
                setError(err?.message || 'Could not load buses. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (source && destination && date) {
            fetchBuses();
        } else {
            setLoading(false);
            setError('Please provide source, destination, and date to search.');
        }
    }, [source, destination, date]);

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
                // Approximate center scroll
                const buttonWidth = 110;
                const containerWidth = scrollContainerRef.current.clientWidth;
                const scrollPos = (index * buttonWidth) - (containerWidth / 2) + (buttonWidth / 2);
                scrollContainerRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
            }
        }
    }, [selectedDateObj, allDates]);

    const handleDateClick = (newDate) => {
        const params = new URLSearchParams(location.search);
        params.set('date', format(newDate, 'yyyy-MM-dd'));
        navigate(`/search?${params.toString()}`);
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
            case 'price_low': return sorted.sort((a, b) => (Number(a.Price) || 0) - (Number(b.Price) || 0));
            case 'price_high': return sorted.sort((a, b) => (Number(b.Price) || 0) - (Number(a.Price) || 0));
            case 'departure': return sorted.sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
            case 'seats': return sorted.sort((a, b) => (Number(b.TotalSeat) || 0) - (Number(a.TotalSeat) || 0));
            default: return sorted;
        }
    }, [buses, sortBy]);

    const handleViewSeats = (bus) => {
        navigate(`/booking/${encodeURIComponent(bus.busno)}`, {
            state: { tripData: bus, source, destination, date },
        });
    };

    const formatDate = (d) => {
        if (!d) return '';
        try {
            const dateObj = new Date(d);
            return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        } catch { return d; }
    };

    const sortOptions = [
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'departure', label: 'Earliest Departure' },
        { value: 'seats', label: 'Most Seats Available' },
    ];

    return (
        <div className="pt-16 min-h-screen bg-slate-50 font-sans">
            <SEOHead
                title={source && destination ? `${source} to ${destination} Bus Tickets` : 'Bus Search Results'}
                description={`Search and book bus tickets${source && destination ? ` from ${source} to ${destination}` : ''} with New Road Travels.`}
                path="/search"
                noIndex={true}
            />

            {/* Route Summary Bar */}
            <div className="bg-white border-b border-slate-100 sticky top-[52px] sm:top-[56px] z-30">
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
                            <span className="font-medium">{formatDate(date)}</span>
                        </div>
                    </div>
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 text-[#DC143C] font-semibold text-sm hover:underline shrink-0"
                    >
                        <Search className="w-3.5 h-3.5" />
                        Modify Search
                    </Link>
                </div>
            </div>

            {/* Date Slider */}
            <div className="bg-white shadow-[0_4px_10px_rgb(0,0,0,0.03)] border-b border-slate-200 sticky top-[108px] sm:top-[124px] z-20">
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
                {!loading && !error && buses.length > 0 && (
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

                {/* Loading State */}
                {loading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-48 h-7 bg-slate-200 rounded-lg animate-pulse" />
                        </div>
                        {[1, 2, 3, 4].map(i => <BusSkeleton key={i} />)}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-16 sm:py-24">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                            <Bus className="w-10 h-10 text-red-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No Buses Found</h2>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">{error}</p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={fetchBuses}
                                className="flex items-center gap-2 bg-[#DC143C] hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-red-500/20 active:scale-[0.97]"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <Link
                                to="/"
                                className="py-2.5 px-6 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
                            >
                                New Search
                            </Link>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && buses.length === 0 && (
                    <div className="text-center py-16 sm:py-24">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <Bus className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">No Buses Available</h2>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
                            No buses found for {source} to {destination} on {formatDate(date)}. Try different dates or routes.
                        </p>
                        <Link
                            to="/"
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
                            key={bus.busno}
                            className="bg-white rounded-2xl border border-slate-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                                    {/* Left: Bus Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Company & Tags */}
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                                {bus.CompanyName}
                                            </h3>
                                            {bus.Touristbus === 'Yes' && (
                                                <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                                                    ✦ Tourist
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mb-3 font-medium">{bus.type}</p>

                                        {/* Route Timeline */}
                                        <div className="flex items-center gap-3 sm:gap-4 mb-3">
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{bus.time}</p>
                                                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{bus.from_id}</p>
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
                                                <p className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">{bus.to_id}</p>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        {bus.Amenities && typeof bus.Amenities === 'string' && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {bus.Amenities.split(',').slice(0, 5).map((a, i) => (
                                                    <span key={i} className="bg-slate-50 text-slate-600 text-[10px] sm:text-[11px] px-2 py-1 rounded-md font-medium border border-slate-100">
                                                        {a.trim()}
                                                    </span>
                                                ))}
                                                {bus.Amenities.split(',').length > 5 && (
                                                    <span className="text-[10px] text-slate-400 px-1 py-1 font-medium">
                                                        +{bus.Amenities.split(',').length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Pickup Points */}
                                        {Array.isArray(bus.from_location1) && bus.from_location1.length > 0 && (
                                            <div className="mt-2 text-[11px] text-slate-400">
                                                <span className="font-semibold text-slate-500">Pickup:</span>{' '}
                                                {bus.from_location1.filter(p => typeof p === 'string').map(p => p.split('(')[0]).join(', ')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Price + Action */}
                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2 min-w-[140px] pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                                        <div className="text-left md:text-right">
                                            <span className="text-2xl sm:text-3xl font-black text-[#DC143C]">
                                                रू {bus.Price}
                                            </span>
                                            {bus.Cashback > 0 && (
                                                <div className="text-[11px] text-emerald-600 font-bold mt-0.5 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">
                                                    💰 Cashback: रू {bus.Cashback}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 md:justify-end">
                                                <Users className="w-3 h-3" />
                                                <span>{bus.TotalSeat} seats</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleViewSeats(bus)}
                                            className="bg-[#DC143C] hover:bg-red-700 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl text-sm transition-all shadow-md shadow-red-500/20 hover:shadow-lg active:scale-[0.97] whitespace-nowrap"
                                        >
                                            View Seats →
                                        </button>

                                        {bus.staffnum && (
                                            <p className="text-[10px] text-slate-400 hidden md:block">Staff: {bus.staffnum}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchResults;



