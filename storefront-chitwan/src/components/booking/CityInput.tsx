'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, ArrowLeft, X, Clock, TrendingUp, Bus } from 'lucide-react';

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

function getRecentCities(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(RECENT_CITIES_KEY);
        if (!raw) return [];
        return JSON.parse(raw).filter((c: string) => availableCities.includes(c));
    } catch {
        return [];
    }
}

function saveRecentCity(city: string) {
    if (typeof window === 'undefined') return;
    try {
        const recent = getRecentCities().filter((c) => c !== city);
        recent.unshift(city);
        localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
    } catch { /* silent */ }
}

interface CityInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (city: string) => void;
    excludeCity?: string;
}

const CityInput: React.FC<CityInputProps> = ({ label, placeholder, value, onChange, excludeCity }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [isMobile, setIsMobile] = useState(false);
    const [recentCities, setRecentCities] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        if (isOpen) {
            setRecentCities(getRecentCities());
        }
    }, [isOpen]);

    useEffect(() => {
        if (isMobile) return; 
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile]);

    useEffect(() => {
        if (!isMobile) return;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
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

    const checkRouteValidity = (selectedCity: string) => {
        if ((selectedCity === "Sauraha" && excludeCity === "Pokhara") ||
            (selectedCity === "Pokhara" && excludeCity === "Sauraha")) {
            return false;
        }
        return true;
    };

    const filteredCities = availableCities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase()) &&
        city !== excludeCity
    );
    const validCities = filteredCities.filter(city => checkRouteValidity(city));

    const popularCities = availableCities
        .filter(c => c !== excludeCity && checkRouteValidity(c));

    const filteredRecent = recentCities
        .filter(c => c !== excludeCity && checkRouteValidity(c));

    const handleSelectCity = useCallback((city: string) => {
        onChange(city);
        setSearchTerm(city);
        setIsOpen(false);
        saveRecentCity(city);
    }, [onChange]);

    const handleInputInteraction = () => {
        if (isMobile) {
            setSearchTerm(''); 
            setIsOpen(true);
        } else {
            setIsOpen(true);
        }
    };

    const mobileOverlay = isMobile && isOpen ? (
        <div
            className="fixed inset-0 bg-white z-[9999] flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm(value); 
                        setIsOpen(false);
                    }}
                    type="button"
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
                        className="w-full bg-slate-50 rounded-full px-5 py-3 text-base text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E31837]/20 focus:bg-white border border-slate-200 focus:border-[#E31837]/40 transition-all"
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
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
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
                                    type="button"
                                    onClick={() => handleSelectCity(city)}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b border-slate-50 last:border-b-0"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-[#E31837]" />
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
                    <>
                        {filteredRecent.length > 0 && (
                            <div className="pt-4 pb-2">
                                <h3 className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Recent searches
                                </h3>
                                {filteredRecent.map((city) => (
                                    <button
                                        key={city}
                                        type="button"
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

                        <div className="pt-4 pb-6">
                            <h3 className="px-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Popular cities
                            </h3>
                            {popularCities.map((city) => (
                                <button
                                    key={city}
                                    type="button"
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

    const desktopDropdown = !isMobile && isOpen && validCities.length > 0 ? (
        <div className="absolute top-full left-0 w-full min-w-[200px] mt-2 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-[50] max-h-60 overflow-y-auto"
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

    return (
        <div className="relative w-full h-full group" ref={wrapperRef}>
            <div className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-nepal-red transition-colors pointer-events-none">
                <Bus className="w-5 h-5" />
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
                className="w-full h-full bg-transparent focus:outline-none text-base sm:text-xl font-bold text-slate-800 cursor-pointer pl-14 md:pl-16 pr-4 pt-5 sm:pt-6 pb-1 placeholder:text-slate-400"
            />
            
            <label className={`absolute left-14 md:left-16 transition-all duration-200 pointer-events-none truncate max-w-[calc(100%-4rem)]
                ${searchTerm || (!isMobile && isOpen)
                    ? 'top-1 sm:top-2 text-[10px] sm:text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider'
                    : 'top-1/2 -translate-y-1/2 text-base sm:text-xl font-normal text-slate-500'
                }`}
            >
                {label || placeholder}
            </label>

            {desktopDropdown}
            {mobileOverlay}
        </div>
    );
};

export default CityInput;
