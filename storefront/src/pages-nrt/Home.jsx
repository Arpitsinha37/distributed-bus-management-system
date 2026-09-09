import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRightLeft, ArrowRight, ArrowLeft, Search, Percent, Ticket, ChevronRight, ChevronLeft, Clock, Bus, Award, Users, Headphones, Star, Shield, Zap, UserCheck, Calendar, Quote, MapPin, ExternalLink } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';

import CityInput from '../components/nrt/CityInput';
import CustomCalendar from '../components/nrt/CustomCalendar';
import { getImageUrl } from '../lib/utils';
import { CircularGallery } from '../components/nrt/ui/circular-gallery';

const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'New Road Travels',
    description: 'Nepal\'s trusted bus booking, tour packages & vehicle rental platform.',
    url: 'https://www.newroadtravels.com',
    telephone: '+977-9856068470',
    email: 'nrttour@gmail.com',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Tourist Bus Park, Sorhakhutte',
        addressLocality: 'Kathmandu',
        addressCountry: 'NP',
    },
    sameAs: [
        'https://facebook.com/newroadtravels',
        'https://instagram.com/newroadtravels',
    ],
};

// ── Session cache helpers — instant load on repeat visits ──
const CACHE_KEY = 'nrt_home_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached() {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.ts > CACHE_TTL) return null;
        return parsed.data;
    } catch { return null; }
}

function setCache(data) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { }
}

// ── Skeleton card components ──
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
        <div className="h-48 sm:h-56 bg-slate-200" />
        <div className="p-5 flex justify-between items-center">
            <div>
                <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                <div className="h-5 w-24 bg-slate-200 rounded" />
            </div>
            <div className="h-10 w-28 bg-slate-100 rounded-lg" />
        </div>
    </div>
);

const SkeletonRentalCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse flex flex-col">
        <div className="h-48 bg-slate-200" />
        <div className="p-5 flex flex-col flex-1">
            <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
            <div className="flex justify-between mb-4">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
            <div className="h-4 w-28 bg-slate-100 rounded mt-auto" />
        </div>
    </div>
);

// ── Popular Routes Data ──
const popularRoutes = [
    { from: 'Kathmandu', to: 'Pokhara', price: 1600, duration: '6-7 hrs', buses: '15+' },
    { from: 'Pokhara', to: 'Kathmandu', price: 1600, duration: '6-7 hrs', buses: '15+' },
    { from: 'Kathmandu', to: 'Chitwan', price: 1300, duration: '5-6 hrs', buses: '10+' },
    { from: 'Chitwan', to: 'Kathmandu', price: 1300, duration: '5-6 hrs', buses: '10+' },
];

// ── Animated Counter Hook ──
function useCountUp(target, duration = 2000, startOnView = true) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!startOnView) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated.current) {
                hasAnimated.current = true;
                const startTime = Date.now();
                const tick = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                    setCount(Math.floor(eased * target));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration, startOnView]);

    return { count, ref };
}

// ── Scroll Fade-In Hook ──
function useFadeIn() {
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return ref;
}

// ── Bus Services Auto-Rotating Carousel ──
const CARDS_PER_PAGE = 4;
const AUTO_ROTATE_MS = 4000;

const BusServicesCarousel = ({ busServices, loading }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef(null);

    const totalPages = Math.max(1, Math.ceil(busServices.length / CARDS_PER_PAGE));

    const goToPage = useCallback((page) => {
        setCurrentPage((page + totalPages) % totalPages);
    }, [totalPages]);

    const goNext = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
    const goPrev = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

    // Auto-rotate
    useEffect(() => {
        if (isPaused || loading || busServices.length <= CARDS_PER_PAGE) return;
        timerRef.current = setInterval(goNext, AUTO_ROTATE_MS);
        return () => clearInterval(timerRef.current);
    }, [isPaused, loading, busServices.length, goNext]);

    const currentItems = busServices.slice(
        currentPage * CARDS_PER_PAGE,
        currentPage * CARDS_PER_PAGE + CARDS_PER_PAGE
    );

    return (
        <section className="w-full py-8 sm:py-20 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-12 gap-3">
                    <div className="text-center sm:text-left w-full sm:w-auto">
                        <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Travel Across Nepal</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Daily Bus Services</h2>
                        <div className="w-16 h-1 bg-nepal-red mt-4 mx-auto sm:mx-0"></div>
                    </div>
                    {busServices.length > CARDS_PER_PAGE && (
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={goPrev}
                                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-nepal-red hover:border-nepal-red hover:shadow-md transition-all"
                                aria-label="Previous services"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={goNext}
                                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-nepal-red hover:border-nepal-red hover:shadow-md transition-all"
                                aria-label="Next services"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Cards area */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    ) : busServices.length === 0 ? (
                        <p className="text-center text-slate-400 py-12">No bus services available. Add some in the CMS admin.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {currentItems.map((item, idx) => (
                                <Link
                                    to={`/bus/${item.slug || item.id}`}
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-slate-100 block hover:-translate-y-1 animate-fade-slide-in"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <div className="relative h-48 sm:h-56 overflow-hidden">
                                        {item.image ? (
                                            <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-slate-800 flex items-center justify-center">
                                                <span className="text-white/60 text-sm font-medium">{item.source} → {item.destination}</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4 w-full">
                                            <p className="text-white font-bold text-lg">{item.title || `${item.source} to ${item.destination}`}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-500 uppercase font-semibold">Starting from</span>
                                            <span className="text-lg font-bold text-nepal-red"><span className="text-sm text-red-500/80 mr-1 font-semibold uppercase tracking-wider">NPR</span>{item.price}</span>
                                        </div>
                                        <button className="px-5 py-2.5 border border-nepal-red text-nepal-red font-bold rounded-lg group-hover:bg-nepal-red group-hover:text-white transition-all text-sm shadow-sm pointer-events-none whitespace-nowrap">
                                            View Details
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dot indicators + View All */}
                {!loading && (
                    <div className="flex flex-col items-center mt-10 gap-4">
                        {busServices.length > CARDS_PER_PAGE && (
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            currentPage === idx
                                                ? 'w-8 bg-nepal-red'
                                                : 'w-2 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                        aria-label={`Go to page ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                        <Link
                            to="/search?source=&destination="
                            className="px-8 py-3 bg-white border-2 border-nepal-red text-nepal-red font-bold rounded-xl hover:bg-nepal-red hover:text-white transition-all flex items-center gap-2 shadow-sm"
                        >
                            View All Bus Services <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [travelDate, setTravelDate] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // ── Data states with cache pre-fill ──
    const cached = getCached();
    const [busServices, setBusServices] = useState(cached?.busServices || []);
    const [tourPackages, setTourPackages] = useState(cached?.tourPackages || []);
    const [vehicleRentals, setVehicleRentals] = useState(cached?.vehicleRentals || []);
    const [featuredBlogs, setFeaturedBlogs] = useState(cached?.featuredBlogs || []);
    const [adventureActivities, setAdventureActivities] = useState(cached?.adventureActivities || []);
    const [loading, setLoading] = useState(!cached); // Instant if cache exists

    // Stats counters
    const yearsCounter = useCountUp(10, 2000);
    const travelersCounter = useCountUp(50000, 2500);
    const departuresCounter = useCountUp(20, 1800);
    const supportCounter = useCountUp(24, 1500);

    // Section fade-in refs
    const routesFadeRef = useFadeIn();
    const trustFadeRef = useFadeIn();

    const handleRouteClick = (from, to) => {
        const params = new URLSearchParams();
        params.set('source', from);
        params.set('destination', to);
        params.set('date', format(new Date(), 'yyyy-MM-dd'));
        navigate(`/search?${params.toString()}`);
    };

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Fetch fresh data in background — page renders immediately
        const fetchAll = async () => {
            try {
                const [bs, tp, vr, fb, aa] = await Promise.all([
                    api.getBusServices().catch(() => []),
                    api.getTourPackages({ isFeatured: 'true' }).catch(() => []),
                    api.getFeaturedVehicleRentals().catch(() => []),
                    api.getFeaturedBlogs().catch(() => []),
                    api.getAdventureActivities().catch(() => []),
                ]);
                setBusServices(bs);
                setTourPackages(tp);
                setVehicleRentals(vr);
                setFeaturedBlogs(fb);
                setAdventureActivities(aa);
                setCache({ busServices: bs, tourPackages: tp, vehicleRentals: vr, featuredBlogs: fb, adventureActivities: aa });
            } catch { }
            setLoading(false);
        };
        fetchAll();

        if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div id="scroll-container" className="relative w-full min-h-screen bg-white font-sans text-slate-800">
            <SEOHead
                title="Bus Booking, Tours & Vehicle Rentals in Nepal"
                description="Book buses, tour packages & rental vehicles across Nepal. Trusted by 50,000+ travelers for safe, comfortable journeys from the Himalayas to the Terai."
                path="/"
                structuredData={localBusinessSchema}
            />
            {/* ═══════════ HERO SECTION ═══════════ */}
            <div
                className="relative w-full"
                style={{ minHeight: '100svh' }}
            >

                {/* Video Layer — Streamed heavily compressed via Cloudinary CDN */}
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://res.cloudinary.com/dealfp76k/video/upload/w_800,f_webp,q_auto:low/Bus_driving_on_mountain_highway_delpmaspu__hajeim.jpg"
                    preload={isMobile ? "metadata" : "auto"}
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                >
                    <source src="https://res.cloudinary.com/dealfp76k/video/upload/f_auto,q_auto/Bus_driving_on_mountain_highway_delpmaspu__hajeim.mp4" type="video/mp4" />
                </video>

                {/* Gradient Overlays — optimized for mobile clarity */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/70 sm:from-black/60 sm:via-black/25 sm:to-black/70 z-10" />
                <div className="absolute bottom-0 left-0 w-full h-36 sm:h-48 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 sm:via-[#0f172a]/80 to-transparent z-10" />

                {/* Decorative glass orbs for depth — hidden on small screens for performance */}
                <div className="hidden sm:block absolute top-20 -left-20 w-72 h-72 bg-[#DC143C]/15 rounded-full blur-[100px] z-10 pointer-events-none" />
                <div className="hidden sm:block absolute bottom-40 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] z-10 pointer-events-none" />

                {/* Hero Content */}
                <div
                    className="relative z-20 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
                    style={{
                        paddingTop: 'max(4.5rem, env(safe-area-inset-top, 20px) + 2.5rem)',
                        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 20px) + 1rem)',
                        minHeight: '100svh',
                    }}
                >

                    {/* Hero Text (Hidden on mobile) */}
                    <div className="hidden md:block">
                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white text-center leading-[1.05] mb-1 sm:mb-4 max-w-full break-words px-2"
                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
                            Experience Nepal
                        </h1>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-center leading-[1.05] mb-2 sm:mb-6 max-w-full break-words px-2"
                            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)', color: '#DC143C' }}>
                            on Wheels
                        </h2>

                        {/* Subtitle */}
                        <p className="max-w-sm sm:max-w-xl text-[11px] sm:text-base md:text-lg text-white/90 text-center font-medium mb-5 sm:mb-10 leading-relaxed px-3"
                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                            From the majestic Himalayas to the plains of Terai. <br className="hidden sm:block" />
                            Travel safely with the most trusted vehicle service in Nepal.
                        </p>
                    </div>

                    {/* ═══ Glassmorphism Search Widget ═══ */}
                    <div className="relative z-20 w-full max-w-[1240px] mx-auto -mt-20 md:mt-0">

                        {/* Glass Card Container */}
                        <div className="relative rounded-2xl sm:rounded-2xl lg:rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:shadow-2xl border border-white/40 sm:border-slate-200">
                            
                            {/* Background Layer */}
                            <div className="absolute inset-0 z-0 bg-white/95 sm:bg-white backdrop-blur-2xl sm:backdrop-blur-none rounded-2xl sm:rounded-2xl lg:rounded-[2rem] overflow-hidden">
                            </div>

                            {/* Content Layer */}
                            <div className="relative z-10 flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-white/25 sm:divide-slate-200">
                                
                                {/* From */}
                                <div className="flex-1 relative hover:bg-white/5 sm:hover:bg-slate-50 rounded-t-2xl lg:rounded-t-none lg:rounded-l-[2rem] transition-colors group">
                                    <div className="flex items-center px-4 py-3 sm:px-5 sm:py-4 lg:p-6">
                                        <CityInput
                                            value={fromCity}
                                            onChange={setFromCity}
                                            placeholder="From"
                                            excludeCity={toCity}
                                        />
                                    </div>
                                </div>

                                {/* Swap (Desktop) */}
                                <div className="absolute top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:block">
                                    <div className="bg-white/90 backdrop-blur-lg p-1 rounded-full border border-white/40 shadow-lg">
                                        <button
                                            onClick={() => {
                                                const temp = fromCity;
                                                setFromCity(toCity);
                                                setToCity(temp);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-500 hover:text-nepal-red hover:shadow-sm focus:outline-none transition-all"
                                        >
                                            <ArrowRightLeft className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* To */}
                                <div className="flex-1 relative hover:bg-white/5 sm:hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center px-4 py-3 sm:px-5 sm:py-4 lg:p-6">
                                        <CityInput
                                            value={toCity}
                                            onChange={setToCity}
                                            placeholder="To"
                                            excludeCity={fromCity}
                                        />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="flex-[2] relative hover:bg-white/5 sm:hover:bg-slate-50 rounded-b-2xl lg:rounded-b-none lg:rounded-r-[2rem] transition-colors group">
                                    <div className="flex items-center px-4 py-3 sm:px-5 sm:py-4 lg:p-5">
                                        <CustomCalendar
                                            selectedDate={travelDate}
                                            onChange={setTravelDate}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Search Button — glassmorphic on mobile, solid on desktop */}
                        <div className="flex justify-center mt-3 sm:absolute sm:left-1/2 sm:-bottom-10 sm:-translate-x-1/2 sm:mt-0 z-30 sm:pointer-events-none"
                            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                        >
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams();
                                    if (fromCity) params.set('source', fromCity);
                                    if (toCity) params.set('destination', toCity);
                                    if (travelDate) params.set('date', format(travelDate, 'yyyy-MM-dd'));
                                    navigate(`/search?${params.toString()}`);
                                }}
                                className="
                                    w-full sm:w-auto sm:pointer-events-auto
                                    px-8 sm:px-10 py-3.5 sm:py-4
                                    bg-[#DC143C] hover:bg-red-700
                                    text-white text-sm sm:text-xl font-bold
                                    rounded-xl sm:rounded-full
                                    shadow-xl shadow-red-900/40 hover:shadow-red-900/60
                                    transition-all flex items-center justify-center gap-2
                                    transform hover:-translate-y-1
                                    backdrop-blur-lg
                                "
                            >
                                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                SEARCH BUSES
                            </button>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="h-2 sm:h-6 w-full"></div>

                </div>
            </div>

            {/* ═══════════ TRANSITION BRIDGE ═══════════ */}
            {/* Smooth gradient from dark hero bottom to light content */}
            <div className="relative z-10 w-full">
                <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-slate-100" />
            </div>

            {/* ═══════════ CONTENT SECTIONS ═══════════ */}
            <div className="relative z-10 w-full pb-12 bg-slate-50">

                {/* ═══ POPULAR ROUTES ═══ */}
                <section ref={routesFadeRef} className="fade-in-section w-full py-6 sm:py-16 px-4 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-6 sm:mb-10">
                            <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Most Booked</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">Popular Bus Routes</h2>
                            <p className="text-slate-500 mt-2 max-w-xl mx-auto">One-click booking on Nepal's busiest travel routes</p>
                            <div className="w-16 h-1 bg-nepal-red mx-auto mt-4"></div>
                        </div>

                        {/* Route Slider */}
                        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                            {popularRoutes.map((route, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const nextDate = new Date(Date.now() + 86400000);
                                        const params = new URLSearchParams();
                                        params.set('source', route.from);
                                        params.set('destination', route.to);
                                        params.set('date', format(nextDate, 'yyyy-MM-dd'));
                                        navigate(`/search?${params.toString()}`);
                                    }}
                                    className="flex-shrink-0 w-[260px] sm:w-[280px] snap-center group bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-nepal-red/30 transition-all duration-300 text-left hover:-translate-y-1 touch-target"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 truncate">
                                            <span className="truncate">{route.from}</span>
                                            <ChevronRight className="w-4 h-4 text-nepal-red flex-shrink-0" />
                                            <span className="truncate">{route.to}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-nepal-red group-hover:text-white transition-colors flex-shrink-0 ml-2">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {route.duration}</span>
                                        <span className="flex items-center gap-1"><Bus className="w-3.5 h-3.5" /> {route.buses} buses</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>


                {/* Section 1: Daily Bus Services — Auto-rotating Carousel */}
                <BusServicesCarousel busServices={busServices} loading={loading} />

                {/* Section 2: Featured Vehicle Rentals */}
                <section className="w-full py-8 sm:py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-3">
                            <div>
                                <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Hire a Vehicle</span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Featured Vehicles for Rent</h2>
                                <p className="text-slate-500 mt-2">Premium cars and buses for your perfect trip.</p>
                            </div>
                            <Link to="/rentals" className="text-nepal-red font-semibold hover:underline whitespace-nowrap">View All Rentals →</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading ? (
                                <>
                                    <SkeletonRentalCard />
                                    <SkeletonRentalCard />
                                    <SkeletonRentalCard />
                                    <SkeletonRentalCard />
                                </>
                            ) : vehicleRentals.length === 0 ? (
                                <p className="col-span-full text-center text-slate-400 py-12">No featured vehicles yet.</p>
                            ) : vehicleRentals.slice(0, 4).map((vehicle) => (
                                <Link key={vehicle.id} to={`/rentals/${vehicle.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all group flex flex-col h-full hover:-translate-y-1">
                                    <div className="relative h-48 overflow-hidden">
                                        {vehicle.images?.[0] ? (
                                            <img src={getImageUrl(vehicle.images[0])} alt={vehicle.vehicleName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                <span className="text-4xl">🚙</span>
                                            </div>
                                        )}
                                        {vehicle.vehicleType && (
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 uppercase tracking-wide">
                                                {vehicle.vehicleType}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-nepal-red transition-colors line-clamp-1">{vehicle.vehicleName}</h3>
                                        <div className="text-sm text-slate-500 mb-4 flex items-center justify-between">
                                            <span className="text-slate-700 font-semibold"><span className="text-[10px] text-slate-400 mr-0.5 font-bold uppercase tracking-wider">NPR</span>{vehicle.pricePerDay}<span className="text-xs text-slate-400 ml-0.5 font-medium">/day</span></span>
                                            <span>{vehicle.capacity} seats</span>
                                        </div>
                                        <span className="text-nepal-red font-semibold text-sm group-hover:underline mt-auto inline-flex items-center">
                                            View Details <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 3: Adventure Activities */}
                <section className="w-full py-8 sm:py-20 px-4 bg-[#1A1F2B] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-nepal-red/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-nepal-blue/5 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-12">
                            <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Thrill & Fun</span>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2">Adventure Activities</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">Experience the thrill of the Himalayas. From the sky to the rivers, Nepal has it all.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                            {adventureActivities.length > 0 ? adventureActivities.map((activity) => (
                                <Link to={`/adventure-activities/${activity.slug}`} key={activity.id} className="bg-white/5 hover:bg-nepal-red backdrop-blur-sm rounded-xl p-4 md:p-6 text-center cursor-pointer transition-all duration-300 border border-white/10 group hover:-translate-y-1 hover:shadow-lg hover:shadow-nepal-red/20 block">
                                    <span className="block text-xs md:text-sm font-semibold group-hover:text-white text-slate-300 transition-colors">{activity.name}</span>
                                </Link>
                            )) : [
                                "Paragliding", "Bungee Jump", "Hot Air Balloon", "Zipline", "Rafting", "Jungle Safari",
                                "Skydiving", "Canoeing", "Ultra-Light Flight", "Biking", "Caves Adventure", "Trekking"
                            ].map((activity, index) => (
                                <div key={index} className="bg-white/5 hover:bg-nepal-red backdrop-blur-sm rounded-xl p-4 md:p-6 text-center cursor-pointer transition-all duration-300 border border-white/10 group hover:-translate-y-1 hover:shadow-lg hover:shadow-nepal-red/20">
                                    <span className="block text-xs md:text-sm font-semibold group-hover:text-white text-slate-300 transition-colors">{activity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 4: Popular Tour Packages */}
                <section className="w-full py-8 sm:py-20 px-4 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Popular Treks & Tours</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Tour Packages</h2>
                            <div className="w-16 h-1 bg-nepal-blue mx-auto mt-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                <>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="rounded-2xl overflow-hidden h-[320px] animate-pulse bg-slate-200" />
                                    ))}
                                </>
                            ) : tourPackages.length === 0 ? (
                                <p className="col-span-4 text-center text-slate-400 py-12">No tour packages yet. Add some in the CMS admin.</p>
                            ) : tourPackages.slice(0, 4).map((pkg) => (
                                <Link key={pkg.id} to={`/tours/${pkg.slug}`} className="group relative rounded-2xl overflow-hidden h-[320px] cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                    {pkg.image || pkg.galleryImages?.[0] ? (
                                        <img src={getImageUrl(pkg.image || pkg.galleryImages?.[0])} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center">
                                            <span className="text-white/50 text-4xl">🏔️</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 flex flex-col justify-end">
                                        <h3 className="text-xl font-bold text-white mb-1">{pkg.title}</h3>
                                        <p className="text-slate-300 text-sm font-medium">{pkg.duration}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-white font-bold"><span className="text-xs text-white/70 mr-1 font-semibold uppercase tracking-wider">NPR</span>{pkg.price}</span>
                                            <span className="text-xs font-bold text-nepal-red uppercase tracking-wider bg-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500">Explore</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 5: Recent/Featured Blogs */}
                <section className="w-full py-8 sm:py-20 px-4 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-3">
                            <div>
                                <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">From Our Blog</span>
                                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">Featured Articles</h2>
                                <p className="text-slate-500 mt-2">Travel tips, guides, and stories from Nepal.</p>
                            </div>
                            <Link to="/blog" className="text-nepal-red font-semibold hover:underline whitespace-nowrap">Read All →</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                <>
                                    {[1,2,3].map(i => (
                                        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                                            <div className="h-44 bg-slate-200" />
                                            <div className="p-5 space-y-3">
                                                <div className="h-3 w-24 bg-slate-200 rounded" />
                                                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                                                <div className="h-3 w-full bg-slate-100 rounded" />
                                                <div className="h-3 w-2/3 bg-slate-100 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : featuredBlogs.length === 0 ? (
                                <p className="col-span-full text-center text-slate-400 py-12">No featured blogs yet.</p>
                            ) : featuredBlogs.slice(0, 3).map((blog) => (
                                <Link key={blog.id} to={`/blog/${blog.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all group flex flex-col h-full hover:-translate-y-1">
                                    <div className="relative h-44 overflow-hidden">
                                        {blog.image ? (
                                            <img src={getImageUrl(blog.image)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                <span className="text-4xl">📝</span>
                                            </div>
                                        )}
                                        {blog.category && (
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-bold text-nepal-red uppercase tracking-wide">
                                                {blog.category}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-center text-[11px] text-slate-400 mb-2 gap-3">
                                            <span>{blog.createdAt ? format(new Date(blog.createdAt), 'MMM dd, yyyy') : ''}</span>
                                            {blog.author && <span>By {blog.author.name}</span>}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-nepal-blue transition-colors line-clamp-2">{blog.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-3 flex-1">{blog.content?.replace(/<[^>]*>/g, '')}</p>
                                        <span className="text-nepal-blue font-semibold text-sm group-hover:underline mt-auto inline-flex items-center">
                                            Read More <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 6: Photo Gallery */}
                <section className="w-full py-12 sm:py-20 px-4 bg-[#0A0F1C] overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                        <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Glimpses of Nepal</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">Our Photo Gallery</h2>
                        <div className="w-16 h-1 bg-nepal-red mx-auto mt-4"></div>
                    </div>
                    
                    <div className="h-[450px] sm:h-[600px] w-full">
                        <CircularGallery 
                            items={[
                                { common: 'Kathmandu Durbar Square', binomial: 'Heritage Site', photo: { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', text: 'Kathmandu', by: 'New Road Travels' } },
                                { common: 'Pokhara Phewa Lake', binomial: 'Nature', photo: { url: 'https://images.unsplash.com/photo-1572099606223-6e29045d7de3?auto=format&fit=crop&w=800&q=80', text: 'Pokhara', by: 'New Road Travels' } },
                                { common: 'Mount Everest', binomial: 'Adventure', photo: { url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80', text: 'Everest', by: 'New Road Travels' } },
                                { common: 'Chitwan National Park', binomial: 'Wildlife', photo: { url: 'https://images.unsplash.com/photo-1590242417436-70e24ecdbf85?auto=format&fit=crop&w=800&q=80', text: 'Chitwan Rhino', by: 'New Road Travels' } },
                                { common: 'Swayambhunath', binomial: 'Culture', photo: { url: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=800&q=80', text: 'Monkey Temple', by: 'New Road Travels' } },
                                { common: 'Bhaktapur', binomial: 'Ancient City', photo: { url: 'https://images.unsplash.com/photo-1614068305367-9366eb990924?auto=format&fit=crop&w=800&q=80', text: 'Bhaktapur', by: 'New Road Travels' } },
                            ]} 
                            radius={isMobile ? 180 : 350} 
                            autoRotateSpeed={0.08}
                        />
                    </div>
                </section>

                {/* ═══ CUSTOMER REVIEWS CAROUSEL ═══ */}
                <section className="w-full py-8 sm:py-20 px-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="text-nepal-red font-bold tracking-wider uppercase text-sm">Trusted by Thousands</span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">What Our Passengers Say</h2>
                            <p className="text-slate-500 mt-2 max-w-xl mx-auto">Real reviews from Google Business & TripAdvisor</p>
                            <div className="w-16 h-1 bg-nepal-red mx-auto mt-4"></div>
                        </div>

                        {/* Verified Badges Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
                            <a href="https://share.google/C9gymODmgKWmzFyBR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
                                <svg viewBox="0 0 24 24" className="w-7 h-7"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                <div>
                                    <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}<span className="text-slate-900 font-bold text-sm ml-1.5">4.9</span></div>
                                    <p className="text-xs text-slate-500 font-medium">Google Business</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors ml-1" />
                            </a>
                            <a href="https://www.tripadvisor.com/Attraction_Review-g293890-d17625441-Reviews-New_road_Travels_and_Tour_Pvt_Ltd-Kathmandu_Kathmandu_Valley_Bagmati_Zone_Centra.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
                                <svg viewBox="0 0 24 24" className="w-7 h-7"><circle cx="12" cy="12" r="12" fill="#34E0A1"/><path d="M12 6.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 8 12 8s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" fill="#fff"/><circle cx="9.5" cy="12.5" r="1.5" fill="#fff"/><circle cx="14.5" cy="12.5" r="1.5" fill="#fff"/><path d="M12 5l1.5 2h-3L12 5z" fill="#fff"/></svg>
                                <div>
                                    <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#34E0A1]" />)}<span className="text-slate-900 font-bold text-sm ml-1.5">5.0</span></div>
                                    <p className="text-xs text-slate-500 font-medium">TripAdvisor</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 transition-colors ml-1" />
                            </a>
                        </div>

                        {/* Scrolling Reviews — CSS animation with mask for smooth fade */}
                        <div className="relative flex overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                            <div className="flex gap-4 sm:gap-6 animate-scroll-reviews hover:[animation-play-state:paused] w-max">
                                {/* Duplicate cards for seamless loop */}
                                {[...Array(2)].map((_, setIdx) => (
                                    <React.Fragment key={setIdx}>
                                        {[
                                            { name: "Aarav Sharma", role: "Kathmandu", text: "The sofa bus to Pokhara was incredibly comfortable. Staff was very professional!", platform: "google", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" },
                                            { name: "Sarah Jenkins", role: "UK Tourist", text: "VIP Sofa bus was a game changer. Smooth ride, perfect AC, safe driving.", platform: "tripadvisor", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
                                            { name: "Rajesh KC", role: "Business Traveler", text: "Their punctuality keeps me coming back. Best bus service in Nepal.", platform: "google", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" },
                                            { name: "Marco Rossi", role: "Italy Tourist", text: "Comfortable reclining seats, blankets, perfect AC. Unforgettable mountain views.", platform: "tripadvisor", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" },
                                            { name: "Priya Adhikari", role: "Student", text: "Affordable and very safe for solo female travelers. Thoughtful features!", platform: "google", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" },
                                            { name: "James Wilder", role: "Australia", text: "Clean bus, polite driver, arrived on schedule. Great value for backpackers.", platform: "tripadvisor", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" },
                                        ].map((r, idx) => (
                                            <div key={`${setIdx}-${idx}`} className={`flex-shrink-0 w-[280px] sm:w-[360px] bg-white rounded-2xl p-5 sm:p-6 border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-lg transition-all ${r.platform === 'tripadvisor' ? 'border-emerald-100' : 'border-slate-100'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${r.platform === 'google' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        {r.platform === 'google' ? (
                                                            <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-3.5 sm:h-3.5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                                        ) : (
                                                            <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-3.5 sm:h-3.5"><circle cx="12" cy="12" r="12" fill="#34E0A1"/><path d="M12 6.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="#fff" fillOpacity=".3"/></svg>
                                                        )}
                                                        <span>{r.platform === 'google' ? 'Google' : 'TripAdvisor'}</span>
                                                    </div>
                                                    <div className="flex gap-0.5">
                                                        {r.platform === 'google'
                                                            ? [...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />)
                                                            : [...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#34E0A1]" />)
                                                        }
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4 sm:line-clamp-none">&quot;{r.text}&quot;</p>
                                                <div className="flex items-center gap-2.5 pt-3 mt-auto border-t border-slate-50">
                                                    <img src={r.img} alt={r.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm" loading="lazy" />
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold text-slate-900">{r.name}</p>
                                                        <p className="text-[10px] sm:text-xs text-slate-400">{r.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* View All CTA */}
                        <div className="text-center mt-10">
                            <Link to="/testimonials" className="inline-flex items-center gap-2 text-nepal-red font-semibold hover:underline text-sm">
                                View All Reviews & Testimonials <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ═══ TRUST & STATS (Moved to bottom, Realistic Design) ═══ */}
                <section ref={trustFadeRef} className="fade-in-section w-full py-8 sm:py-20 px-4 bg-white border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        
                        {/* Stats Row - Minimalist, no uniform boxes */}
                        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-8 md:gap-12 mb-16">
                            <div className="text-center flex-1 min-w-[150px]">
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
                                    <span ref={yearsCounter.ref}>{yearsCounter.count.toLocaleString()}</span>+
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Years of Trust</p>
                            </div>
                            <div className="text-center flex-1 min-w-[150px]">
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
                                    <span ref={travelersCounter.ref}>{travelersCounter.count.toLocaleString()}</span>+
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Happy Travelers</p>
                            </div>
                            <div className="text-center flex-1 min-w-[150px]">
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
                                    <span ref={departuresCounter.ref}>{departuresCounter.count.toLocaleString()}</span>+
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Daily Departures</p>
                            </div>
                            <div className="text-center flex-1 min-w-[150px]">
                                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 mb-2">
                                    <span ref={supportCounter.ref}>{supportCounter.count.toLocaleString()}</span>/7
                                </h3>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Customer Support</p>
                            </div>
                        </div>

                        {/* Real Logos / Badges Row */}
                        <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 border border-slate-100 shadow-sm">
                            
                            {/* Payment Partners */}
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Secure Payments via</p>
                                <div className="flex items-center justify-center md:justify-start gap-5">
                                    <img src="/assets/payment/esewa-logo.png" alt="eSewa" className="h-9 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
                                    <img src="/assets/payment/khalti-logo.png" alt="Khalti" className="h-9 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" />
                                    <div className="flex items-center gap-1.5 text-slate-400 font-bold px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer hover:text-slate-600 hover:border-slate-300 transition-colors bg-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                        <span className="text-[11px] uppercase tracking-wider">Mobile Banking</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-8">
                                {/* Google Rating */}
                                <div className="flex items-center gap-3 group cursor-pointer">
                                    <svg className="w-10 h-10 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    <div className="text-left">
                                        <div className="flex text-yellow-400 text-sm">★★★★★</div>
                                        <p className="text-xs font-bold text-slate-800">4.9/5 Rating</p>
                                    </div>
                                </div>
                                {/* Verified Operator */}
                                <div className="flex items-center gap-3 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                        <Shield className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-800">Verified Operators</p>
                                        <p className="text-xs text-slate-500">100% Safe Travel</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;


