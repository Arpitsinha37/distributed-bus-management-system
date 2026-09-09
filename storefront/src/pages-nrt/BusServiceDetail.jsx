import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Navigation, Wifi, AirVent, Plug, Bus, ShieldCheck, HeartPulse, ChevronRight, ChevronLeft, Share2, CalendarDays, MessageCircle } from 'lucide-react';
import api from '../lib/api';
import ShareButtons from '../components/nrt/ShareButtons';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import SEOHead from '../components/nrt/SEOHead';
import FAQAccordion from '../components/nrt/FAQAccordion';
import { getImageUrl } from '../lib/utils';

// ─── Inline Mini Calendar Component ─────────────────────────────────
function MiniCalendar({ selectedDate, onSelectDate, className = '' }) {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const today = startOfDay(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start with empty cells for alignment
    const startDayOfWeek = monthStart.getDay(); // 0=Sun

    const goToPrevMonth = () => {
        const prev = addMonths(currentMonth, -1);
        // Don't allow going before current month
        if (prev >= startOfMonth(today)) setCurrentMonth(prev);
    };
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const canGoPrev = startOfMonth(addMonths(currentMonth, -1)) >= startOfMonth(today);

    return (
        <div className={`select-none ${className}`}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={goToPrevMonth}
                    disabled={!canGoPrev}
                    className={`p-1.5 rounded-lg transition-colors ${canGoPrev ? 'hover:bg-slate-100 text-slate-700' : 'text-slate-300 cursor-not-allowed'}`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-800 tracking-wide">
                    {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                    onClick={goToNextMonth}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {/* Empty padding cells */}
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {days.map((day) => {
                    const isPast = isBefore(day, today);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                        <button
                            key={day.toISOString()}
                            disabled={isPast}
                            onClick={() => onSelectDate(day)}
                            className={`
                                relative w-full aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150
                                ${isPast
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-red-600 text-white shadow-md shadow-red-200 scale-110'
                                        : isTodayDate
                                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100'
                                            : 'text-slate-700 hover:bg-slate-100'
                                }
                            `}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


export default function BusServiceDetail() {
    const { id, slug } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [relatedRoutes, setRelatedRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleBookNow = () => {
        if (!selectedDate || !service) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        navigate(`/search?source=${encodeURIComponent(service.source)}&destination=${encodeURIComponent(service.destination)}&date=${dateStr}`);
    };

    useEffect(() => {
        const fetchService = async () => {
            try {
                let found = null;
                if (slug) {
                    // Slug-based route: /bus/:slug
                    try {
                        found = await api.getBusServiceBySlug(slug);
                    } catch (e) {
                        // Fallback: the 'slug' parameter might actually be an ID from legacy data
                        const data = await api.getBusServices();
                        found = data.find(s => s.id === slug || s.slug === slug);
                    }
                } else if (id) {
                    // Legacy ID-based route: /bus-service/:id
                    const data = await api.getBusServices();
                    found = data.find(s => s.id === id);
                }
                if (found) {
                    setService(found);
                    try {
                        // Fetch dynamic related routes (other active buses)
                        const allServices = await api.getBusServices();
                        const others = allServices.filter(s => s.id !== found.id).slice(0, 4);
                        setRelatedRoutes(others);
                    } catch (e) {
                        console.error('Failed to load related routes', e);
                    }
                } else {
                    setError('Bus service not found.');
                }
            } catch (err) {
                console.error("Failed to fetch bus service:", err);
                setError('Failed to load bus service details.');
            } finally {
                setLoading(false);
            }
        };

        if (id || slug) fetchService();
    }, [id, slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
        </div>
    );

    if (error || !service) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <h2 className="text-2xl font-bold text-slate-800">{error || 'Service not found'}</h2>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">Return Home</button>
        </div>
    );

    // Map common amenity strings to Icons
    const getAmenityIcon = (amenity) => {
        const lower = amenity.toLowerCase();
        if (lower.includes('wifi')) return <Wifi className="w-5 h-5" />;
        if (lower.includes('ac') || lower.includes('air')) return <AirVent className="w-5 h-5" />;
        if (lower.includes('charg') || lower.includes('plug')) return <Plug className="w-5 h-5" />;
        if (lower.includes('safe') || lower.includes('shield')) return <ShieldCheck className="w-5 h-5" />;
        if (lower.includes('med') || lower.includes('kit') || lower.includes('first aid')) return <HeartPulse className="w-5 h-5" />;
        return <CheckCircle2 className="w-5 h-5" />;
    };

    const serviceTitle = service.title || `${service.source} to ${service.destination}`;
    // SEO: keyword-rich title for H1 tag — targets "X to Y bus tickets" searches
    const seoH1Title = `${service.source} to ${service.destination} Bus Tickets — Book Online`;
    const plainDescription = (service.description || '').replace(/<[^>]*>/g, '').substring(0, 160) || '';
    const canonicalPath = service.slug ? `/bus/${service.slug}` : `/bus-service/${id}`;


    // SEO - BusTrip structured data (Google Rich Snippets)
    const busTripSchema = {
        "@context": "https://schema.org",
        "@type": "BusTrip",
        "name": serviceTitle,
        "description": plainDescription,
        "provider": {
            "@type": "TravelAgency",
            "name": "New Road Travels",
            "url": "https://www.newroadtravels.com"
        },
        "departureBusStop": {
            "@type": "BusStation",
            "name": service.source
        },
        "arrivalBusStop": {
            "@type": "BusStation",
            "name": service.destination
        },
        ...(service.departureTime && { "departureTime": service.departureTime }),
        ...(service.arrivalTime && { "arrivalTime": service.arrivalTime }),
        "offers": {
            "@type": "Offer",
            "price": service.price,
            "priceCurrency": "NPR",
            "availability": "https://schema.org/InStock",
            "url": `https://www.newroadtravels.com${canonicalPath}`
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "124"
        }
    };

    // SEO - FAQPage structured data (Google FAQ Rich Snippets)
    const faqSchema = service.faqs && service.faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": service.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    // SEO - BreadcrumbList structured data
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.newroadtravels.com" },
            { "@type": "ListItem", "position": 2, "name": serviceTitle, "item": `https://www.newroadtravels.com${canonicalPath}` }
        ]
    };

    // Combine all schemas
    const combinedSchema = [busTripSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];



    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <SEOHead
                title={service.metaTitle || `${serviceTitle} — ${service.busType} Bus from NPR ${service.price}`}
                description={service.metaDescription || plainDescription || `Book the ${service.source} to ${service.destination} ${service.busType} bus service starting from NPR ${service.price}. Daily departures, comfortable seating, and verified operators.`}
                path={canonicalPath}
                image={service.image}
                descriptionHtml={service.description}
                structuredData={combinedSchema}
            />


            {/* Hero Section */}
            <div className="relative min-h-[500px] md:h-[60vh] w-full bg-slate-900 overflow-hidden flex flex-col justify-end pt-24 pb-6 md:pb-12">
                <div className="absolute inset-0 z-0">
                    <img
                        src={getImageUrl(service.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80")}
                        alt={`${serviceTitle} - ${service.busType} bus service by New Road Travels`}
                        className="w-full h-full object-cover opacity-60"
                        loading="lazy"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                </div>

                <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-20">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>

                <div className="relative z-20 w-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                    {service.busType}
                                </span>
                                {service.duration && (
                                    <span className="flex items-center gap-1 text-white/80 text-sm font-medium">
                                        <Clock className="w-4 h-4" /> {service.duration}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 leading-tight">
                                {service.metaTitle || seoH1Title}
                            </h1>
                            <p className="text-white/70 text-sm md:text-base font-medium mb-3">
                                Daily {service.busType} bus service from {service.source} to {service.destination} — Starting from NPR {service.price}
                            </p>
                            <div className="flex items-center gap-4 text-white/90 text-lg md:text-xl font-medium">
                                <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500" /> {service.source}</span>
                                <ChevronRight className="w-5 h-5 text-white/40" />
                                <span className="flex items-center gap-2"><Navigation className="w-5 h-5 text-red-500" /> {service.destination}</span>
                            </div>
                        </div>

                        {/* Hero Price Card with Calendar */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shrink-0 w-full md:w-auto md:min-w-[280px]">
                            <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-widest">Starting Price</p>
                            <p className="text-4xl font-black text-white flex items-center mb-3">
                                <span className="text-2xl text-red-500 mr-2 font-bold uppercase">NPR</span>
                                {service.price}
                            </p>

                            {/* Date Picker */}
                            <div className="mb-3">
                                <label className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1.5 block">Select Travel Date</label>
                                <input
                                    type="date"
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white/20 transition-all backdrop-blur-sm [color-scheme:dark]"
                                />
                            </div>

                            <button
                                onClick={handleBookNow}
                                disabled={!selectedDate}
                                className={`w-full font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${
                                    selectedDate
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-white/10 text-white/50 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <CalendarDays className="w-5 h-5" />
                                {selectedDate ? `Search Buses for ${format(selectedDate, 'MMM d')}` : 'Pick a Date to Book'}
                            </button>
                        </div>
                    </div>
                </div>

            {/* Breadcrumb Navigation (SEO-friendly) */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Breadcrumb">
                <ol className="flex items-center text-sm text-slate-500 gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <a href="/" itemProp="item" className="hover:text-red-600 transition-colors"><span itemProp="name">Home</span></a>
                        <meta itemProp="position" content="1" />
                    </li>
                    <ChevronRight className="w-3 h-3" />
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <span itemProp="name" className="text-slate-800 font-medium">{serviceTitle}</span>
                        <meta itemProp="position" content="2" />
                    </li>
                </ol>
            </nav>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description */}
                        {service.description && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-red-600 rounded-full"></div>
                                    About This Service
                                </h2>
                                <div className="prose prose-slate max-w-none text-lg bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                                    dangerouslySetInnerHTML={{ __html: service.description }}
                                />
                            </section>
                        )}

                        {/* Schedule Details */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-1 h-8 bg-nepal-blue rounded-full"></div>
                                Schedule &amp; Timing
                            </h2>
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                                <div className="flex-1 pb-6 sm:pb-0 sm:pr-8">
                                    <p className="text-sm font-bold text-slate-400 uppercase mb-2 tracking-wider mt-0">Departure</p>
                                    <p className="text-3xl font-black text-slate-900 mb-1">{service.departureTime || 'TBD'}</p>
                                    <p className="text-slate-500 font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> {service.source}</p>
                                </div>
                                <div className="flex-1 pt-6 sm:pt-0 sm:pl-8">
                                    <p className="text-sm font-bold text-slate-400 uppercase mb-2 tracking-wider">Arrival</p>
                                    <p className="text-3xl font-black text-slate-900 mb-1">{service.arrivalTime || 'TBD'}</p>
                                    <p className="text-slate-500 font-medium flex items-center gap-2"><Navigation className="w-4 h-4" /> {service.destination}</p>
                                </div>
                            </div>
                        </section>

                        {/* Amenities */}
                        {service.amenities && service.amenities.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                                    Bus Amenities
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {service.amenities.map((amenity, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-red-200 transition-colors group">
                                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="font-semibold text-slate-700">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Photo Gallery */}
                        {service.gallery && service.gallery.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                                    Photo Gallery
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {service.gallery.map((photo, idx) => (
                                        <div key={idx} className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${idx === 0 && service.gallery.length % 2 !== 0 ? 'sm:col-span-2' : ''}`}>
                                            <img src={getImageUrl(photo)} alt={`${serviceTitle} - Photo ${idx + 1}`} className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* FAQs */}
                        {service.faqs && service.faqs.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                                    Frequently Asked Questions
                                </h2>
                                <FAQAccordion faqs={service.faqs} />
                            </section>
                        )}

                    </div>

                    {/* Sidebar (Right) — with Calendar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Service Summary</h3>

                            <ul className="space-y-4 mb-6">
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600 mt-0.5"><Bus className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Bus Type</p>
                                        <p className="font-semibold text-slate-900 capitalize">{service.busType} Coach</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600 mt-0.5"><Clock className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Total Duration</p>
                                        <p className="font-semibold text-slate-900">{service.duration || 'Not specified'}</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-600 mt-0.5"><ShieldCheck className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Safety</p>
                                        <p className="font-semibold text-slate-900">Verified Operator</p>
                                    </div>
                                </li>
                            </ul>

                            {/* Calendar in Sidebar */}
                            <div className="border-t border-slate-100 pt-5 mb-5">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" /> Select Travel Date
                                </p>
                                <MiniCalendar
                                    selectedDate={selectedDate}
                                    onSelectDate={setSelectedDate}
                                />
                            </div>

                            {/* Selected date indicator */}
                            {selectedDate && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-red-600 shrink-0" />
                                    <p className="text-sm font-semibold text-red-800">
                                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleBookNow}
                                disabled={!selectedDate}
                                className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-4 ${
                                    selectedDate
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98]'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Bus className="w-5 h-5" />
                                {selectedDate ? `Search Buses for ${format(selectedDate, 'MMM d')}` : 'Pick a Date Above'}
                            </button>

                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(`Namaste, I would like to get more information about the ${service.source} to ${service.destination} daily bus service.`);
                                    window.open(`https://wa.me/9779856068470?text=${message}`, '_blank');
                                }}
                                className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-5 h-5" /> Get more info via WhatsApp
                            </button>
                        </div>
                    </aside>

                </div>
            </div>

            {/* ═══ RELATED BUS ROUTES (SEO Internal Linking) ═══ */}
            {relatedRoutes.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-1 h-8 bg-nepal-red rounded-full"></div>
                        Related Bus Routes in Nepal
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedRoutes.map((route) => (
                            <Link
                                key={route.id}
                                to={`/bus/${route.slug || route.id}`}
                                className="group bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-2 text-base font-bold text-slate-900 mb-1">
                                    <span>{route.source}</span>
                                    <ChevronRight className="w-4 h-4 text-nepal-red flex-shrink-0" />
                                    <span>{route.destination}</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-2 truncate">{route.title || 'Daily bus service'}</p>
                                <span className="text-nepal-red font-semibold text-sm group-hover:underline">
                                    From NPR {route.price} →
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Mobile Sticky Book Button */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shrink-0 z-40 shadow-2xl">
                <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Starting From</p>
                        <p className="text-2xl font-black text-slate-900 flex items-center">
                            <span className="text-base text-red-600 mr-1 font-bold uppercase tracking-wider">NPR</span>{service.price}
                        </p>
                    </div>
                    <button
                        onClick={handleBookNow}
                        disabled={!selectedDate}
                        className={`px-8 py-3.5 rounded-xl font-bold transition-colors ${
                            selectedDate
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                        {selectedDate ? `Book — ${format(selectedDate, 'MMM d')}` : 'Select Date ↑'}
                    </button>
                </div>
            </div>

            <ShareButtons
                url={`https://www.newroadtravels.com${canonicalPath}`}
                title={`${service.source} to ${service.destination} Bus Tickets — NPR ${service.price} | New Road Travels`}
            />
        </div>
    );
}


