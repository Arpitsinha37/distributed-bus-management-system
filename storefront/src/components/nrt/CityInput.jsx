import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, ArrowLeft, X, Clock, TrendingUp } from 'lucide-react';

const availableCities = [
    "Kathmandu",
    "Pokhara",
    "Sauraha",
    "Lumbini",
    "Chitwan",
    "Butwal",
    "Dharan",
    "Biratnagar"
];

const RECENT_CITIES_KEY = 'nrt_recent_cities';
const MAX_RECENT = 5;

// ── localStorage helpers for recent cities ──
function getRecentCities() {
    try {
        const raw = localStorage.getItem(RECENT_CITIES_KEY);
        if (!raw) return [];
        return JSON.parse(raw).filter(c => availableCities.includes(c));
    } catch {
        return [];
    }
}

function saveRecentCity(city) {
    try {
        const recent = getRecentCities().filter(c => c !== city);
        recent.unshift(city);
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
    } catch { /* silent */ }
}

const CityInput = ({ label, placeholder, value, onChange, excludeCity }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [isMobile, setIsMobile] = useState(false);
    const [recentCities, setRecentCities] = useState([]);
    const wrapperRef = useRef(null);
    const mobileInputRef = useRef(null);

    // ── Mobile detection ──
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── Sync value prop → local searchTerm ──
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // ── Load recent cities when modal opens ──
    useEffect(() => {
        if (isOpen) {
            setRecentCities(getRecentCities());
        }
    }, [isOpen]);

    // ── Desktop: close dropdown on outside click ──
    useEffect(() => {
        if (isMobile) return; // modal handles its own close
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile]);

    // ── Mobile: lock body scroll when overlay is open ──
    useEffect(() => {
        if (!isMobile) return;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Auto-focus the search input after a small delay so the overlay is rendered
            setTimeout(() => {
                mobileInputRef.current?.focus();
            }, 100);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile]);

    // ── Route validity check ──
    const checkRouteValidity = (selectedCity) => {
        if ((selectedCity === "Sauraha" && excludeCity === "Pokhara") ||
            (selectedCity === "Pokhara" && excludeCity === "Sauraha")) {
            return false;
        }
        return true;
    };

    // ── Filtered & valid cities ──
    const filteredCities = availableCities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase()) &&
        city !== excludeCity
    );
    const validCities = filteredCities.filter(city => checkRouteValidity(city));

    // ── Popular cities (exclude already-selected other city) ──
    const popularCities = availableCities
        .filter(c => c !== excludeCity && checkRouteValidity(c));

    // ── Recent cities filtered ──
    const filteredRecent = recentCities
        .filter(c => c !== excludeCity && checkRouteValidity(c));

    // ── Select handler ──
    const handleSelectCity = useCallback((city) => {
        onChange(city);
        setSearchTerm(city);
        setIsOpen(false);
        saveRecentCity(city);
    }, [onChange]);

    // ── Handle mobile input open ──
    const handleInputInteraction = () => {
        if (isMobile) {
            setSearchTerm(''); // Clear so user starts fresh search
            setIsOpen(true);
        } else {
            setIsOpen(true);
        }
    };

    // ═══════════════════════════════════════════
    // MOBILE FULLSCREEN OVERLAY
    // ═══════════════════════════════════════════
    const mobileOverlay = isMobile && isOpen ? (
        <div
            className="fixed inset-0 bg-white z-[9999] flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            {/* ── Header with search bar ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
                <button
                    onClick={() => {
                        setSearchTerm(value); // Restore previous value
                        setIsOpen(false);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors shrink-0"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>

                <div className="flex-1 relative">
                    <input
                        ref={mobileInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${placeholder?.toLowerCase() || 'city'}...`}
                        className="w-full bg-slate-50 rounded-full px-5 py-3 text-base text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DC143C]/20 focus:bg-white border border-slate-200 focus:border-[#DC143C]/40 transition-all"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                mobileInputRef.current?.focus();
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Scrollable results area ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">

                {/* If user is typing → show filtered results */}
                {searchTerm.length > 0 ? (
                    <div className="py-2">
                        {validCities.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                    <MapPin className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">No cities found for "{searchTerm}"</p>
                                <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
                            </div>
                        ) : (
                            validCities.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => handleSelectCity(city)}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50 last:border-b-0"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-[#DC143C]" />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-slate-800">{city}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Nepal</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    /* Empty search → show Recent + Popular */
                    <>
                        {/* Recent Searches */}
                        {filteredRecent.length > 0 && (
                            <div className="pt-4 pb-2">
                                <h3 className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Recent searches
                                </h3>
                                {filteredRecent.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => handleSelectCity(city)}
                                        className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-base font-medium text-slate-700">{city}</span>
                                    </button>
                                ))}
                                <div className="mx-6 border-b border-slate-100 mt-2" />
                            </div>
                        )}

                        {/* Popular Cities */}
                        <div className="pt-4 pb-6">
                            <h3 className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Popular cities
                            </h3>
                            {popularCities.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => handleSelectCity(city)}
                                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                                >
                                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <span className="text-base font-medium text-slate-700">{city}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    ) : null;

    // ═══════════════════════════════════════════
    // DESKTOP DROPDOWN (unchanged)
    // ═══════════════════════════════════════════
    const desktopDropdown = !isMobile && isOpen && validCities.length > 0 ? (
        <div className="absolute top-full left-0 w-full min-w-[200px] mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-60 overflow-y-auto"
            style={{ minWidth: 'min(100vw - 2rem, 300px)' }}
        >
            {validCities.map((city) => (
                <div
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="px-6 py-3 hover:bg-rose-50 cursor-pointer text-slate-700 font-medium flex items-center gap-3 transition-colors"
                >
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {city}
                </div>
            ))}
        </div>
    ) : null;

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════
    return (
        <div className="relative w-full h-full group" ref={wrapperRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-nepal-red transition-colors">
                {/* Bus Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" /><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" /><circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" /></svg>
            </div>

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    if (!isMobile) {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        if (e.target.value === '') {
                            onChange('');
                        }
                    }
                }}
                onFocus={handleInputInteraction}
                onClick={handleInputInteraction}
                readOnly={isMobile}
                placeholder=""
                className="w-full h-full bg-transparent focus:outline-none text-base sm:text-xl font-bold text-slate-800 cursor-pointer pl-12 pr-4 pt-5 sm:pt-6 pb-1 placeholder:text-slate-400"
            />
            {/* Label: Acts as placeholder when empty, moves up when active */}
            <label className={`absolute left-12 transition-all duration-200 pointer-events-none truncate max-w-[calc(100%-4rem)]
                ${searchTerm || (!isMobile && isOpen)
                    ? 'top-1 sm:top-2 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider'
                    : 'top-1/2 -translate-y-1/2 text-base sm:text-xl font-normal text-slate-500'
                }`}
            >
                {placeholder}
            </label>

            {/* Desktop Dropdown */}
            {desktopDropdown}

            {/* Mobile Fullscreen Overlay (portalled to body via fixed positioning) */}
            {mobileOverlay}
        </div>
    );
};

export default CityInput;

