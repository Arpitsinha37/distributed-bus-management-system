import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Check, ChevronLeft, ChevronRight, Fuel, Users, Settings, MapPin, Phone, ArrowRight } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import ShareButtons from '../components/nrt/ShareButtons';
import FAQAccordion from '../components/nrt/FAQAccordion';
import { getImageUrl } from '../lib/utils';
import { api } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || '';

const RentalDetail = () => {
    const { slug } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [related, setRelated] = useState([]);
    const phoneNumber = "9779856068470";

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const data = await api.getVehicleRentalBySlug(slug);
                if (data && data.id) {
                    setVehicle(data);

                    // Fetch related vehicles of same type
                    try {
                        const relData = await api.getVehicleRentals({ vehicleType: data.vehicleType, limit: '4' });
                        setRelated(Array.isArray(relData) ? relData.filter(v => v.id !== data.id).slice(0, 3) : []);
                    } catch (relErr) {
                        console.error('Failed to fetch related vehicles:', relErr);
                    }
                } else {
                    setVehicle(null);
                }
            } catch (err) {
                console.error('Failed to fetch vehicle:', err);
                setVehicle(null);
            }
            setLoading(false);
        };
        fetchVehicle();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleBookClick = (name) => {
        const message = encodeURIComponent(`Namaste, I am interested in renting "${name}". Please provide details and availability.`);
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-nepal-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading vehicle details...</p>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Vehicle Not Found</h2>
                    <p className="text-slate-600 mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
                    <Link to="/rentals" className="inline-flex items-center gap-2 px-6 py-3 bg-nepal-red text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Rentals
                    </Link>
                </div>
            </div>
        );
    }

    const images = vehicle.images && vehicle.images.length > 0
        ? vehicle.images.map(img => getImageUrl(img))
        : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'];

    const seoSchema = {
        "@context": "https://schema.org",
        "@type": ["Product", "RentalCarReservation"],
        "name": vehicle.vehicleName,
        "description": vehicle.description,
        "image": images,
        "brand": {
            "@type": "Brand",
            "name": vehicle.vehicleType
        },
        "offers": {
            "@type": "Offer",
            "price": vehicle.pricePerDay,
            "priceCurrency": "NPR",
            "availability": vehicle.availabilityStatus === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": window.location.href,
            "seller": {
                "@type": "TravelAgency",
                "name": "New Road Travels"
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <SEOHead
                title={vehicle.seoTitle || `${vehicle.vehicleName} - Vehicle Rental`}
                description={vehicle.seoDescription || vehicle.description?.substring(0, 155) || `Rent ${vehicle.vehicleName} in Nepal. ${vehicle.capacity} seats, ${vehicle.fuelType}, ${vehicle.transmission}. Book via WhatsApp with New Road Travels.`}
                keywords={vehicle.seoKeywords || ''}
                path={`/rentals/${slug}`}
                image={images[0]}
                structuredData={[
                    seoSchema,
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.newroadtravels.com" },
                            { "@type": "ListItem", "position": 2, "name": "Rentals", "item": "https://www.newroadtravels.com/rentals" },
                            { "@type": "ListItem", "position": 3, "name": vehicle.vehicleName, "item": `https://www.newroadtravels.com/rentals/${slug}` }
                        ]
                    }
                ]}
            />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/" className="hover:text-nepal-red transition-colors">Home</Link>
                        <span className="text-slate-300">/</span>
                        <Link to="/rentals" className="hover:text-nepal-red transition-colors">Rental Services</Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900 font-medium">{vehicle.vehicleName}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

                    {/* ───────── Left: Image Gallery (3 cols) ───────── */}
                    <div className="lg:col-span-3">
                        <div className="relative rounded-2xl overflow-hidden bg-slate-200 aspect-[4/3] shadow-lg group">
                            <img
                                src={images[activeImage]}
                                alt={vehicle.vehicleName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                                    </button>
                                    <button onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                                        <ChevronRight className="w-5 h-5 text-slate-700" />
                                    </button>
                                </>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-800 uppercase shadow">
                                    {vehicle.vehicleType}
                                </span>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                {activeImage + 1} / {images.length}
                            </div>
                        </div>

                        {/* Thumbnails — larger and cleaner */}
                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                                {images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImage(idx)}
                                        className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === idx
                                            ? 'border-nepal-red ring-2 ring-nepal-red/20 shadow-md scale-105'
                                            : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                                            }`}>
                                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Desktop-only: Overview & About below the gallery */}
                        <div className="hidden lg:block mt-8 space-y-6">
                            {vehicle.description && (
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">Overview</h3>
                                    <div className="prose prose-slate max-w-none bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: vehicle.description }}
                                    />
                                </div>
                            )}

                            {vehicle.about && (
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">About this Vehicle</h3>
                                    <div className="prose prose-slate max-w-none bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: vehicle.about }}
                                    />
                                </div>
                            )}

                            {/* FAQs */}
                            {vehicle.faqs && vehicle.faqs.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h3>
                                    <FAQAccordion faqs={vehicle.faqs} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ───────── Right: Vehicle Info Card (2 cols) ───────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden lg:sticky lg:top-24">

                            {/* Header: Availability + Name + Price */}
                            <div className="p-6 pb-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${vehicle.availabilityStatus === 'available'
                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                        : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${vehicle.availabilityStatus === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                        {vehicle.availabilityStatus === 'available' ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{vehicle.vehicleName}</h1>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-nepal-red"><span className="text-xl text-red-500/80 mr-1.5 font-semibold">NPR</span>{vehicle.pricePerDay?.toLocaleString()}</span>
                                    <span className="text-sm font-medium text-slate-400">/day</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mx-6 my-5 border-t border-slate-100"></div>

                            {/* Quick Specs — 2×2 grid */}
                            <div className="px-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Users, label: 'Capacity', value: `${vehicle.capacity} Seats` },
                                        { icon: Settings, label: 'Transmission', value: vehicle.transmission },
                                        { icon: Fuel, label: 'Fuel Type', value: vehicle.fuelType },
                                        { icon: MapPin, label: 'Type', value: vehicle.vehicleType },
                                    ].map((spec, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100/80">
                                            <spec.icon className="w-6 h-6 text-nepal-red mx-auto mb-2" />
                                            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{spec.label}</div>
                                            <div className="text-sm font-bold text-slate-800 capitalize mt-0.5">{spec.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mx-6 my-5 border-t border-slate-100"></div>

                            {/* Features */}
                            {vehicle.features && vehicle.features.length > 0 && (
                                <div className="px-6">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Features & Amenities</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {vehicle.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2.5 text-slate-600 py-1">
                                                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                </div>
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Divider */}
                                    <div className="mt-5 border-t border-slate-100"></div>
                                </div>
                            )}

                            {/* CTA Buttons — inline, not sticky */}
                            <div className="p-6 space-y-3">
                                <button onClick={() => handleBookClick(vehicle.vehicleName)}
                                    className="w-full py-4 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-600/20 active:scale-[0.98] text-base">
                                    <MessageCircle className="w-5 h-5" />
                                    Book via WhatsApp
                                </button>
                                <a href={`tel:+${phoneNumber}`}
                                    className="w-full py-3.5 bg-slate-50 border border-slate-200 hover:border-nepal-red text-slate-700 hover:text-nepal-red font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm">
                                    <Phone className="w-4 h-4" />
                                    Call Us: +977-9856068470
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ───────── Mobile-only: Overview, About, FAQs below ───────── */}
                    <div className="lg:hidden col-span-1 space-y-6">
                        {vehicle.description && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Overview</h3>
                                <div className="prose prose-slate max-w-none bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                                    dangerouslySetInnerHTML={{ __html: vehicle.description }}
                                />
                            </div>
                        )}

                        {vehicle.about && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">About this Vehicle</h3>
                                <div className="prose prose-slate max-w-none bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                                    dangerouslySetInnerHTML={{ __html: vehicle.about }}
                                />
                            </div>
                        )}

                        {vehicle.faqs && vehicle.faqs.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h3>
                                <FAQAccordion faqs={vehicle.faqs} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Vehicles */}
                {related.length > 0 && (
                    <div className="mt-16 border-t border-slate-200 pt-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Similar Vehicles</h2>
                            <Link to="/rentals" className="text-sm font-semibold text-nepal-red hover:text-red-700 transition-colors flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {related.map((item) => (
                                <Link key={item.id} to={`/rentals/${item.slug}`}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={item.images?.[0] ? getImageUrl(item.images[0]) : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'}
                                            alt={item.vehicleName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {/* Price badge */}
                                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                                            <span className="text-sm font-bold text-nepal-red"><span className="text-[10px] text-red-500/80 mr-0.5 font-bold uppercase tracking-wider">NPR</span>{item.pricePerDay?.toLocaleString()}</span>
                                            <span className="text-xs text-slate-400">/day</span>
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 uppercase">
                                            {item.vehicleType}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-900 group-hover:text-nepal-red transition-colors text-lg">{item.vehicleName}</h3>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {item.capacity} seats</span>
                                            <span className="text-slate-200">·</span>
                                            <span className="capitalize">{item.fuelType}</span>
                                            <span className="text-slate-200">·</span>
                                            <span className="capitalize">{item.transmission}</span>
                                        </div>
                                        <div className="mt-4 text-sm font-semibold text-nepal-red opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                                            View Details <ArrowRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-14">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Need a Custom Vehicle?</h2>
                    <p className="text-slate-300 mb-8 max-w-lg mx-auto">Contact us for custom requirements, bulk bookings, or special travel packages across Nepal.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/rentals" className="px-8 py-3.5 bg-nepal-red text-white font-bold rounded-full hover:bg-red-700 transition-colors inline-flex items-center gap-2">
                            Browse All Vehicles <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleBookClick('a custom vehicle')}
                            className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/20 inline-flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            <ShareButtons
                url={`https://www.newroadtravels.com/rentals/${vehicle?.slug || ''}`}
                title={`${vehicle?.vehicleName || 'Vehicle Rental'} | New Road Travels`}
            />
        </div>
    );
};

export default RentalDetail;


