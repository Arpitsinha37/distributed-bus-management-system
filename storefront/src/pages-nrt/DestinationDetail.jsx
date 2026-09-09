import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';
import { FaMapMarkerAlt, FaStar, FaArrowLeft, FaMountain, FaCamera, FaHiking } from 'react-icons/fa';
import { getImageUrl } from '../lib/utils';

const DestinationDetail = () => {
    const { slug } = useParams();
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tourPackages, setTourPackages] = useState([]);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        api.destinations.getBySlug(slug)
            .then(data => {
                setDestination(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [slug]);

    // Also fetch related tour packages
    useEffect(() => {
        api.tourPackages?.list?.().then(data => {
            if (data && data.length > 0) {
                setTourPackages(data.slice(0, 3));
            }
        }).catch(() => { });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!destination) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Destination Not Found</h1>
                <p className="text-gray-500 mb-6">The destination you're looking for doesn't exist.</p>
                <Link to="/tours" className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors">
                    ← Back to Tours
                </Link>
            </div>
        );
    }

    const plainDesc = (destination.description || '').replace(/<[^>]*>/g, '').substring(0, 160) || `Discover ${destination.name} with New Road Travels.`;

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title={destination.seoTitle || `${destination.name} — Explore Nepal | New Road Travels`}
                description={destination.seoDescription || plainDesc}
                path={`/destinations/${slug}`}
                image={destination.image ? getImageUrl(destination.image) : undefined}
                structuredData={[
                    {
                        "@context": "https://schema.org",
                        "@type": "TouristDestination",
                        "name": destination.name,
                        "description": destination.seoDescription || plainDesc,
                        "image": destination.image ? getImageUrl(destination.image) : "https://www.newroadtravels.com/og-default.png",
                        "containedInPlace": {
                            "@type": "Country",
                            "name": "Nepal"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.newroadtravels.com" },
                            { "@type": "ListItem", "position": 2, "name": "Destinations", "item": "https://www.newroadtravels.com/destinations" },
                            { "@type": "ListItem", "position": 3, "name": destination.name, "item": `https://www.newroadtravels.com/destinations/${slug}` }
                        ]
                    }
                ]}
            />

            {/* Hero Image */}
            <div className="relative h-[50vh] md:h-[65vh] overflow-hidden">
                {destination.image ? (
                    <img
                        src={getImageUrl(destination.image)}
                        alt={destination.imageAlt || destination.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-600"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {/* Back button */}
                <Link to="/tours" className="absolute top-24 left-6 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition-colors text-sm font-medium">
                    <FaArrowLeft className="text-xs" /> Back to Tours
                </Link>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                            <FaMapMarkerAlt className="text-red-400" />
                            <span>Nepal</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 font-serif">{destination.name}</h1>
                        {destination.subtitle && (
                            <p className="text-lg md:text-xl text-white/80 font-light">{destination.subtitle}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Description */}
                {destination.description && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaCamera className="text-red-500" /> About this Destination
                        </h2>
                        <div
                            className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: destination.description }}
                        />
                    </div>
                )}

                {/* Highlights */}
                {destination.highlights && destination.highlights.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaStar className="text-amber-500" /> Highlights
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {destination.highlights.map((h, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <div className="text-gray-700 font-medium prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: h }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Tour Packages */}
                {tourPackages.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FaHiking className="text-green-600" /> Related Tour Packages
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {tourPackages.map(tour => (
                                <Link key={tour.id} to={`/tours/${tour.slug}`} className="group">
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                                        {tour.image && (
                                            <div className="h-40 overflow-hidden">
                                                <img src={getImageUrl(tour.image)} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{tour.title}</h3>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">{tour.duration}</span>
                                                <span className="font-bold text-red-600">रू {tour.price?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEO Keywords as tags */}
                {destination.seoKeywords && (
                    <div className="pt-8 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {destination.seoKeywords.split(',').map((kw, i) => (
                                <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                    {kw.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to explore {destination.name}?</h2>
                    <p className="text-white/80 mb-8 text-lg">Book a tour package or find bus tickets to get started.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/tours" className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
                            View Tour Packages
                        </Link>
                        <Link to="/" className="bg-white/20 text-white border border-white/30 px-8 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors backdrop-blur-sm">
                            Search Bus Tickets
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetail;


