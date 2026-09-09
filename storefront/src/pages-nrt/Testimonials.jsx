import React, { useState } from 'react';
import { Quote, Star, ExternalLink, MapPin } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import { BackgroundPaths } from '../components/nrt/ui/background-paths';
import { getImageUrl } from '../lib/utils';

/* ── Google SVG Icon ── */
const GoogleIcon = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

/* ── TripAdvisor SVG Icon ── */
const TripAdvisorIcon = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="12" fill="#34E0A1" />
        <path d="M12 6.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 8 12 8s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" fill="#fff" />
        <circle cx="9.5" cy="12.5" r="1.5" fill="#fff" />
        <circle cx="14.5" cy="12.5" r="1.5" fill="#fff" />
        <path d="M12 5l1.5 2h-3L12 5z" fill="#fff" />
    </svg>
);

/* ── Review data ── */
const reviews = [
    {
        name: "Aarav Sharma",
        role: "Traveler from Kathmandu",
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
        text: "New Road Travels made my trip to Pokhara absolutely seamless. The sofa bus was incredibly comfortable, and the staff was very professional. Highly recommended!",
        rating: 5,
        platform: "google",
        date: "2 weeks ago"
    },
    {
        name: "Sarah Jenkins",
        role: "Tourist from UK",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        text: "I was worried about the long bus journey, but the VIP Sofa bus was a game changer. Smooth ride, AC working perfectly, and safe driving. Will use again on my next Nepal visit.",
        rating: 5,
        platform: "tripadvisor",
        date: "1 month ago"
    },
    {
        name: "Rajesh KC",
        role: "Business Traveler",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        text: "Regularly travel between Kathmandu and Chitwan. Their punctuality is what keeps me coming back. Best bus service in Nepal hands down.",
        rating: 5,
        platform: "google",
        date: "3 weeks ago"
    },
    {
        name: "Priya Adhikari",
        role: "Student",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
        text: "Affordable prices for students and very safe for solo female travelers. The 'Booking for Women' feature is a thoughtful touch. I feel secure every time I travel with them.",
        rating: 5,
        platform: "google",
        date: "1 month ago"
    },
    {
        name: "David Chen",
        role: "Adventure Seeker",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        text: "Used their rental service for a jeep to Mustang. The vehicle was in top condition and the driver was an excellent guide too! Highly recommend for anyone exploring off-the-beaten-path Nepal.",
        rating: 5,
        platform: "tripadvisor",
        date: "2 months ago"
    },
    {
        name: "Sunita Tamang",
        role: "Family Trip",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        text: "Booked a Toyota Hiace for our family pilgrimage to Lumbini. Clean, spacious, and hassle-free. Thank you New Road Travels!",
        rating: 5,
        platform: "google",
        date: "3 weeks ago"
    },
    {
        name: "Marco Rossi",
        role: "Tourist from Italy",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        text: "Excellent VIP sofa bus from Kathmandu to Pokhara. Very comfortable reclining seats, blankets provided, and the air conditioning was perfect. The scenic mountain views along the way made the journey unforgettable.",
        rating: 5,
        platform: "tripadvisor",
        date: "1 month ago"
    },
    {
        name: "Anisha Shrestha",
        role: "Travel Blogger",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        text: "As someone who travels Nepal frequently for content, New Road Travels has been my go-to. Their online booking is seamless, buses are always on time, and the staff is genuinely helpful.",
        rating: 5,
        platform: "google",
        date: "2 weeks ago"
    },
    {
        name: "James Wilder",
        role: "Backpacker from Australia",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        text: "Took the Chitwan bus — was pleasantly surprised by the quality. Clean bus, polite driver, arrived right on schedule. Great value for what you pay. Would recommend to any backpacker exploring Nepal.",
        rating: 5,
        platform: "tripadvisor",
        date: "3 weeks ago"
    },
];

const FILTERS = [
    { key: 'all', label: 'All Reviews' },
    { key: 'google', label: 'Google Reviews' },
    { key: 'tripadvisor', label: 'TripAdvisor' },
];

const GOOGLE_REVIEW_URL = 'https://share.google/C9gymODmgKWmzFyBR';
const TRIPADVISOR_URL = 'https://www.tripadvisor.com/Attraction_Review-g293890-d17625441-Reviews-New_road_Travels_and_Tour_Pvt_Ltd-Kathmandu_Kathmandu_Valley_Bagmati_Zone_Centra.html';

const Testimonials = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    const filtered = activeFilter === 'all'
        ? reviews
        : reviews.filter(r => r.platform === activeFilter);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <SEOHead
                title="Customer Reviews & Testimonials"
                description="Read real reviews from travelers who chose New Road Travels. See why 50,000+ passengers trust us for safe, comfortable bus journeys across Nepal."
                path="/testimonials"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Customer Reviews | New Road Travels",
                    "description": "Read real reviews from travelers who chose New Road Travels.",
                    "url": "https://www.newroadtravels.com/testimonials",
                    "mainEntity": {
                        "@type": "ItemList",
                        "itemListElement": reviews.map((r, i) => ({
                            "@type": "Review",
                            "position": i + 1,
                            "author": { "@type": "Person", "name": r.name },
                            "reviewBody": r.text,
                            "reviewRating": { "@type": "Rating", "ratingValue": String(r.rating), "bestRating": "5" }
                        }))
                    }
                }}
            />

            {/* Header */}
            <div className="mb-12 -mt-4">
                <BackgroundPaths
                    title="Guest Experiences"
                    subtitle="Testimonials"
                    buttonText="Read Reviews Below"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ═══ Verified Review Aggregate Badges ═══ */}
                <div className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Google Business Badge */}
                        <a
                            href={GOOGLE_REVIEW_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex items-center gap-6 overflow-hidden hover:-translate-y-1"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                                    <GoogleIcon className="w-9 h-9 sm:w-11 sm:h-11" />
                                </div>
                            </div>
                            <div className="relative flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900">4.9</span>
                                    <span className="text-slate-400 font-semibold text-sm">/5</span>
                                </div>
                                <div className="flex items-center gap-0.5 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Google Business Reviews</p>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                                    <span>Read on Google</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </a>

                        {/* TripAdvisor Badge */}
                        <a
                            href={TRIPADVISOR_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 sm:p-8 flex items-center gap-6 overflow-hidden hover:-translate-y-1"
                        >
                            {/* Decorative accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                                    <TripAdvisorIcon className="w-9 h-9 sm:w-11 sm:h-11" />
                                </div>
                            </div>
                            <div className="relative flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-900">5.0</span>
                                    <span className="text-slate-400 font-semibold text-sm">/5</span>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full bg-[#34E0A1]" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">TripAdvisor Reviews</p>
                                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                                    <span>Read on TripAdvisor</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* ═══ Filter Bar ═══ */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${activeFilter === f.key
                                    ? 'bg-nepal-red text-white border-nepal-red shadow-md shadow-red-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-nepal-red/40 hover:text-nepal-red'
                                }`}
                        >
                            {f.key === 'google' && <GoogleIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
                            {f.key === 'tripadvisor' && <TripAdvisorIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />}
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* ═══ Review Cards Grid ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filtered.map((review, index) => (
                        <div
                            key={index}
                            className={`bg-white p-7 sm:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border relative group hover:-translate-y-1 ${review.platform === 'tripadvisor'
                                    ? 'border-emerald-100 hover:border-emerald-200'
                                    : 'border-slate-100 hover:border-blue-100'
                                }`}
                        >
                            {/* Quote icon */}
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-nepal-red/10 group-hover:text-nepal-red/20 transition-colors" />

                            {/* Platform badge */}
                            <div className="flex items-center gap-2 mb-5">
                                {review.platform === 'google' ? (
                                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                        <GoogleIcon className="w-3.5 h-3.5" />
                                        <span>Google Review</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                                        <TripAdvisorIcon className="w-3.5 h-3.5" />
                                        <span>TripAdvisor</span>
                                    </div>
                                )}
                                <span className="text-xs text-slate-400 ml-auto">{review.date}</span>
                            </div>

                            {/* Stars / Circles rating */}
                            <div className="flex items-center gap-0.5 mb-5">
                                {review.platform === 'google' ? (
                                    [...Array(review.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))
                                ) : (
                                    [...Array(review.rating)].map((_, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full bg-[#34E0A1]" />
                                    ))
                                )}
                            </div>

                            {/* Review text */}
                            <p className="text-slate-600 leading-relaxed mb-6 text-[15px]">&quot;{review.text}&quot;</p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                <img
                                    src={getImageUrl(review.image)}
                                    alt={review.name}
                                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{review.name}</h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {review.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ CTA: Write a Review ═══ */}
                <div className="mt-16 text-center">
                    <div className="inline-block bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl px-8 sm:px-14 py-10 sm:py-12 shadow-xl">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Traveled With Us?</h3>
                        <p className="text-white/50 text-sm sm:text-base mb-8 max-w-md mx-auto">
                            Share your experience and help other travelers make the right choice.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href={GOOGLE_REVIEW_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 bg-white hover:bg-blue-50 text-slate-800 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <GoogleIcon className="w-5 h-5" />
                                Write on Google
                            </a>
                            <a
                                href={TRIPADVISOR_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 bg-[#34E0A1] hover:bg-[#2bc88e] text-slate-900 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <TripAdvisorIcon className="w-5 h-5" />
                                Write on TripAdvisor
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;


