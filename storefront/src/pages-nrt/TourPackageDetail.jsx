import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Users, Mountain, CheckCircle, XCircle, ArrowLeft, Image, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import ShareButtons from '../components/nrt/ShareButtons';
import api from '../lib/api';
import { getImageUrl } from '../lib/utils';

// ── Helper: Parse HTML blob into individual text items ──
// The CMS rich editor stores included/excluded services as a single string
// with multiple <div><span>Item</span></div> blocks. This extracts each item.
function parseHtmlToItems(htmlString) {
    if (!htmlString) return [];
    // Create a temp DOM element to parse HTML
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    const items = [];
    // Try to extract text from each <div> or <li> or <p> child
    const blocks = div.querySelectorAll('div, li, p');
    if (blocks.length > 0) {
        blocks.forEach(block => {
            const text = block.textContent?.trim();
            if (text && text.length > 0) items.push(text);
        });
    }
    // Fallback: if no block elements, just get text content
    if (items.length === 0) {
        const text = div.textContent?.trim();
        if (text) items.push(text);
    }
    return items;
}

// ── Helper: Extract clean text from HTML string ──
function stripHtml(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent?.trim() || '';
}

// ── Gallery Lightbox Component ──
const GalleryLightbox = ({ images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setCurrentIndex(i => (i + 1) % images.length);
            if (e.key === 'ArrowLeft') setCurrentIndex(i => (i - 1 + images.length) % images.length);
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [images.length, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-50 p-2">
                <X className="w-7 h-7" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 text-white/80 hover:text-white p-2 z-50"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i => (i + 1) % images.length); }}
                className="absolute right-4 text-white/80 hover:text-white p-2 z-50"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
            <img
                src={getImageUrl(images[currentIndex])}
                alt={`Gallery ${currentIndex + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-6 text-white/60 text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

// ── FAQ Accordion Item ──
const FaqItem = ({ question, answer, isOpen, onToggle }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
        >
            <span className="font-semibold text-slate-800">{question}</span>
            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
        </button>
        {isOpen && (
            <div className="px-5 pb-5 text-slate-600 leading-relaxed prose prose-sm max-w-none border-t border-slate-100 pt-3"
                dangerouslySetInnerHTML={{ __html: answer }}
            />
        )}
    </div>
);

const TourPackageDetail = () => {
    const { slug } = useParams();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [openFaqIndex, setOpenFaqIndex] = useState(0);
    const [expandedDays, setExpandedDays] = useState({});

    useEffect(() => {
        const fetchPackage = async () => {
            setLoading(true);
            try {
                const data = await api.getTourPackageBySlug(slug);
                if (!data) {
                    setError('Tour package not found');
                } else {
                    setPkg(data);
                    setSelectedImage(data.image || data.galleryImages?.[0] || null);
                    // Auto-expand first 2 itinerary days
                    if (data.itinerary?.length > 0) {
                        setExpandedDays({ 0: true, 1: true });
                    }
                }
            } catch (err) {
                setError('Failed to load tour package');
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [slug]);

    // Parse included/excluded services from HTML blobs
    const parsedIncludes = useMemo(() => {
        if (!pkg?.includedServices?.length) return [];
        return pkg.includedServices.flatMap(s => parseHtmlToItems(s));
    }, [pkg?.includedServices]);

    const parsedExcludes = useMemo(() => {
        if (!pkg?.excludedServices?.length) return [];
        return pkg.excludedServices.flatMap(s => parseHtmlToItems(s));
    }, [pkg?.excludedServices]);

    // Parse highlights
    const parsedHighlights = useMemo(() => {
        if (!pkg?.highlights?.length) return [];
        return pkg.highlights.flatMap(h => {
            // If it's HTML, parse it
            if (h.includes('<')) return parseHtmlToItems(h);
            return [h];
        }).filter(Boolean);
    }, [pkg?.highlights]);

    // Parse FAQs
    const faqs = useMemo(() => {
        if (!pkg?.faqs) return [];
        try {
            const parsed = typeof pkg.faqs === 'string' ? JSON.parse(pkg.faqs) : pkg.faqs;
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }, [pkg?.faqs]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !pkg) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20 gap-4">
                <p className="text-xl text-slate-500">{error || 'Package not found'}</p>
                <Link to="/" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>
        );
    }

    const allImages = [pkg.image, ...(pkg.galleryImages || [])].filter(Boolean);
    const plainDesc = (pkg.description || '').replace(/<[^>]*>/g, '').substring(0, 160) || `Explore ${pkg.title} tour package`;

    // SEO structured data
    const structuredData = [
        {
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            "name": pkg.title,
            "description": plainDesc,
            "image": pkg.image ? getImageUrl(pkg.image) : "https://www.newroadtravels.com/og-default.png",
            "touristType": "Adventure",
            "provider": {
                "@type": "TravelAgency",
                "name": "New Road Travels",
                "url": "https://www.newroadtravels.com",
                "telephone": "+977-9856068470",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Tourist Bus Park, Sorhakhutte",
                    "addressLocality": "Kathmandu",
                    "addressCountry": "NP"
                }
            },
            "offers": {
                "@type": "Offer",
                "price": pkg.price,
                "priceCurrency": "NPR",
                "availability": "https://schema.org/InStock",
                "url": `https://www.newroadtravels.com/tours/${slug}`
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "124"
            },
            ...(pkg.itinerary?.length > 0 && {
                "itinerary": {
                    "@type": "ItemList",
                    "itemListElement": pkg.itinerary.map((day, idx) => ({
                        "@type": "ListItem",
                        "position": idx + 1,
                        "name": `Day ${day.day}: ${day.title}`,
                        "description": day.description
                    }))
                }
            })
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.newroadtravels.com" },
                { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://www.newroadtravels.com/tours" },
                { "@type": "ListItem", "position": 3, "name": pkg.title, "item": `https://www.newroadtravels.com/tours/${slug}` }
            ]
        },
        ...(faqs.length > 0 ? [{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": { "@type": "Answer", "text": stripHtml(faq.answer) }
            }))
        }] : [])
    ];

    const toggleDay = (idx) => {
        setExpandedDays(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <SEOHead
                title={`${pkg.title} | New Road Travels`}
                description={plainDesc}
                path={`/tours/${slug}`}
                image={pkg.image ? getImageUrl(pkg.image) : undefined}
                structuredData={structuredData}
            />

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <GalleryLightbox
                    images={allImages}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}

            {/* Hero Section */}
            <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                {selectedImage ? (
                    <img src={getImageUrl(selectedImage)} alt={pkg.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center">
                        <Mountain className="w-24 h-24 text-white/30" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto">
                    <Link to="/tours" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Tours
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{pkg.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 md:gap-5 text-white/90 text-sm md:text-base">
                        {pkg.duration && (
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"><Clock className="w-4 h-4" /> {pkg.duration}</span>
                        )}
                        {pkg.difficulty && (
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full capitalize"><Mountain className="w-4 h-4" /> {pkg.difficulty}</span>
                        )}
                        {pkg.maxGroupSize && (
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"><Users className="w-4 h-4" /> Max {pkg.maxGroupSize}</span>
                        )}
                        {pkg.startLocation && (
                            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4" /> {pkg.startLocation}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* ═══ 1. Overview / About This Tour ═══ */}
                        {pkg.description && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-red-500" />
                                    Tour Overview
                                </h2>
                                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                                    <div className="prose prose-slate prose-lg max-w-none
                                        prose-headings:text-slate-900 prose-headings:font-bold
                                        prose-p:text-slate-600 prose-p:leading-relaxed
                                        prose-strong:text-slate-800
                                        prose-li:text-slate-600
                                        prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline"
                                        dangerouslySetInnerHTML={{ __html: pkg.description }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ═══ 2. Tour Highlights ═══ */}
                        {parsedHighlights.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                    Tour Highlights
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {parsedHighlights.map((h, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            </div>
                                            <span className="text-slate-700 text-sm leading-relaxed">{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ═══ 3. Detailed Itinerary ═══ */}
                        {pkg.itinerary && Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-red-500" />
                                    Detailed Itinerary
                                </h2>
                                <div className="relative">
                                    {/* Timeline connector */}
                                    <div className="absolute left-[1.4rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-red-500 via-red-300 to-red-100 hidden sm:block"></div>

                                    <div className="space-y-4">
                                        {pkg.itinerary.map((day, idx) => {
                                            const isExpanded = expandedDays[idx];
                                            return (
                                                <div key={day.id || idx} className="relative">
                                                    {/* Timeline dot */}
                                                    <div className="absolute left-[1.05rem] top-5 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm z-10 hidden sm:block"></div>

                                                    <div className={`sm:ml-12 bg-white rounded-xl shadow-sm border transition-all ${isExpanded ? 'border-red-200 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
                                                        <button
                                                            onClick={() => toggleDay(idx)}
                                                            className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-block bg-red-500 text-white font-bold px-3 py-1 rounded-lg text-xs min-w-[3.5rem] text-center">
                                                                    Day {day.day}
                                                                </span>
                                                                <h3 className="text-base font-bold text-slate-900">{day.title}</h3>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {day.elevation && (
                                                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded hidden md:inline-flex items-center gap-1">
                                                                        <Mountain className="w-3 h-3" /> {day.elevation}m
                                                                    </span>
                                                                )}
                                                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="px-5 pb-5 border-t border-slate-100">
                                                                {day.elevation && (
                                                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-3 mb-3 md:hidden">
                                                                        <Mountain className="w-4 h-4 text-slate-400" />
                                                                        Elevation: {day.elevation}m
                                                                    </div>
                                                                )}
                                                                <div className="text-slate-600 leading-relaxed prose prose-sm max-w-none mt-3"
                                                                    dangerouslySetInnerHTML={{ __html: day.description }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Expand/Collapse All */}
                                {pkg.itinerary.length > 3 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => {
                                                const allExpanded = Object.keys(expandedDays).length === pkg.itinerary.length && Object.values(expandedDays).every(Boolean);
                                                if (allExpanded) {
                                                    setExpandedDays({});
                                                } else {
                                                    const all = {};
                                                    pkg.itinerary.forEach((_, i) => { all[i] = true; });
                                                    setExpandedDays(all);
                                                }
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700 font-semibold"
                                        >
                                            {Object.keys(expandedDays).length === pkg.itinerary.length && Object.values(expandedDays).every(Boolean)
                                                ? '▲ Collapse All Days'
                                                : '▼ Expand All Days'}
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* ═══ 4. Cost Includes / Excludes ═══ */}
                        {(parsedIncludes.length > 0 || parsedExcludes.length > 0) && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-5">Cost Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {parsedIncludes.length > 0 && (
                                        <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                                            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                What's Included
                                            </h3>
                                            <ul className="space-y-3">
                                                {parsedIncludes.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-slate-700">
                                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {parsedExcludes.length > 0 && (
                                        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                                            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-500" />
                                                What's Not Included
                                            </h3>
                                            <ul className="space-y-3">
                                                {parsedExcludes.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-slate-600">
                                                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* ═══ 5. Photo Gallery ═══ */}
                        {allImages.length > 1 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <Image className="w-6 h-6 text-red-500" />
                                    Photo Gallery
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setLightboxIndex(i)}
                                            className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-200"
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${pkg.title} - Photo ${i + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                                                    <Image className="w-5 h-5 text-slate-700" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ═══ 6. FAQs ═══ */}
                        {faqs.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                    <HelpCircle className="w-6 h-6 text-red-500" />
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-3">
                                    {faqs.map((faq, idx) => (
                                        <FaqItem
                                            key={idx}
                                            question={faq.question}
                                            answer={faq.answer}
                                            isOpen={openFaqIndex === idx}
                                            onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-6">
                            <div className="bg-red-50 rounded-2xl p-6 md:p-8 flex flex-col justify-center items-center gap-2 shadow-sm border border-red-100">
                                <p className="text-sm text-red-600 font-semibold uppercase tracking-wider">Total Package Cost</p>
                                <p className="text-4xl font-bold text-red-600"><span className="text-xl text-red-500/80 mr-1.5 font-semibold">NPR</span>{pkg.price?.toLocaleString()}</p>
                                <p className="text-sm text-slate-500">per person</p>
                            </div>

                            <div className="space-y-3 text-sm">
                                {pkg.duration && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        <span>{pkg.duration}</span>
                                    </div>
                                )}
                                {pkg.difficulty && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Mountain className="w-5 h-5 text-slate-400" />
                                        <span className="capitalize">Difficulty: {pkg.difficulty}</span>
                                    </div>
                                )}
                                {pkg.maxGroupSize && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <span>Max group: {pkg.maxGroupSize} people</span>
                                    </div>
                                )}
                                {pkg.startLocation && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <span>Starts: {pkg.startLocation}</span>
                                    </div>
                                )}
                                {pkg.endLocation && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <span>Ends: {pkg.endLocation}</span>
                                    </div>
                                )}
                            </div>

                            <a
                                href={`https://wa.me/9779856068470?text=${encodeURIComponent(`Hi! I'm interested in the "${pkg.title}" tour package.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md"
                            >
                                📱 Inquire on WhatsApp
                            </a>

                            <a
                                href="tel:+9779856068470"
                                className="block w-full bg-red-600 hover:bg-red-700 text-white text-center font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-md"
                            >
                                📞 Call to Book
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <ShareButtons
                url={`https://www.newroadtravels.com/tours/${pkg?.slug || ''}`}
                title={`${pkg?.title || 'Tour Package'} | New Road Travels`}
            />
        </div>
    );
};

export default TourPackageDetail;


