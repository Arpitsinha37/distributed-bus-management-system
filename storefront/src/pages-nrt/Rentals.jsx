import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Check, ArrowRight } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import { BackgroundPaths } from '../components/nrt/ui/background-paths';

import { getImageUrl } from '../lib/utils';
import api from '../lib/api';

const Rentals = () => {
    const phoneNumber = "9779856068470";
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

        useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const data = await api.getVehicleRentals({ limit: 50 });
                if (Array.isArray(data)) {
                    setItems(data.map(v => ({
                        id: v.id,
                        slug: v.slug,
                        title: v.vehicleName,
                        image: v.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80',
                        features: v.features || [],
                        category: v.vehicleType,
                        fromCMS: true,
                    })));
                } else {
                    setItems([]);
                }
            } catch (err) {
                console.log('Error fetching rentals:', err);
                setItems([]);
            }
            setLoading(false);
        };
        fetchVehicles();
    }, []);

    const handleRentClick = (e, vehicleName) => {
        e.preventDefault();
        e.stopPropagation();
        const message = encodeURIComponent(`Namaste, I am interested in renting a ${vehicleName}. Please provide details.`);
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const seoSchema = {
        "@context": "https://schema.org",
        "@type": "OfferCatalog",
        "name": "Vehicle Rental Services in Nepal",
        "description": "Rent luxury sofa buses, SUVs, Jeeps, Toyota Hiace & wedding cars in Nepal.",
        "itemListElement": items.map((item, index) => ({
            "@type": "Offer",
            "itemOffered": {
                "@type": "Product",
                "name": item.title,
                "image": item.image,
                "category": item.category
            },
            "position": index + 1,
            "url": `${window.location.origin}/rentals/${item.slug}`
        }))
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <SEOHead
                title="Vehicle Rental Services"
                description="Rent luxury sofa buses, SUVs, Jeeps, Toyota Hiace & wedding cars in Nepal. Premium fleet for tours, events & corporate travel. Book via WhatsApp."
                path="/rentals"
                structuredData={seoSchema}
            />
            {/* Hero */}
            <BackgroundPaths title="Vehicle Rental Services" subtitle="Premium Fleet" buttonText="Browse Our Fleet" />

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-nepal-red border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map((item, index) => (
                            <Link key={item.id || index} to={`/rentals/${item.slug}`}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 flex flex-col no-underline">
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={getImageUrl(item.image)}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 uppercase">
                                        {item.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-nepal-red transition-colors">{item.title}</h3>

                                    <ul className="space-y-2 mb-6 flex-grow">
                                        {item.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-slate-500">
                                                <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <span
                                        className="w-full py-3 bg-slate-900 group-hover:bg-nepal-red text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-auto"
                                    >
                                        More Options
                                        <ArrowRight className="w-5 h-5 ml-1" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Direct Contact Section */}
            <div className="bg-white py-12 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Can't find what you're looking for?</h2>
                    <p className="text-slate-600 mb-8">Contact us directly for custom requirements and bulk bookings.</p>
                    <button
                        onClick={(e) => handleRentClick(e, "Custom Requirement")}
                        className="px-8 py-3 bg-nepal-red text-white font-bold rounded-full hover:bg-red-700 transition-colors"
                    >
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rentals;


