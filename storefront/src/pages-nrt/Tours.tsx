import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
import StoryUpdates from '../components/nrt/StoryUpdates';
import api from '../lib/api';

import { BlurFade } from "@/components/nrt/ui/blur-fade";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/nrt/ui/dot-pattern";

// Cloudinary CDN URLs (auto-optimized: format, quality, size)
const CDN = 'https://res.cloudinary.com/dealfp76k/image/upload/f_auto,q_auto';
const TourKathmanduImg = `${CDN}/newroadtravels/tour/kathmandu_durbar`;
const TourPokharaImg = `${CDN}/newroadtravels/tour/phewa`;
const TourEverestImg = `${CDN}/newroadtravels/tour/everest`;
const TourChitwanImg = `${CDN}/newroadtravels/tour/Chitwan_National_Park`;

interface TourItem {
    title: string;
    imageSrc: string;
    slug: string;
}

const fallbackTours: TourItem[] = [
    { title: 'Kathmandu Heritage Tour', slug: 'kathmandu-heritage', imageSrc: TourKathmanduImg },
    { title: 'Pokhara Leisure Tour', slug: 'pokhara-leisure-tour', imageSrc: TourPokharaImg },
    { title: 'Everest Base Camp Trek', slug: 'everest-base-camp-trek', imageSrc: TourEverestImg },
    { title: 'Chitwan Jungle Safari', slug: 'chitwan-jungle-safari', imageSrc: TourChitwanImg },
];

const Tours = () => {
    const [toursData, setToursData] = useState<TourItem[]>(fallbackTours);
    const navigate = useNavigate();

    // Fetch tour packages from API
    useEffect(() => {
        api.getTourPackages().then((data: any[]) => {
            if (data && data.length > 0) {
                const items: TourItem[] = data.map((pkg: any) => {
                    return {
                        title: pkg.title,
                        slug: pkg.slug,
                        imageSrc: pkg.image || pkg.galleryImages?.[0] || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
                    };
                });
                setToursData(items);
            }
        }).catch((err) => {
            console.error("Failed to fetch tour packages", err);
            // Keep fallback data
        });
    }, []);

    const handleDestinationClick = (slug: string) => {
        if (slug) {
            navigate(`/tours/${slug}`);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans pb-24">
            <SEOHead
                title="Special Tours - Discover Nepal's Beauty"
                description="Explore uniquely curated special tours covering Nepal's majestic landscapes, heritage sites, and wildlife."
                path="/tours"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Nepal Tour Packages | New Road Travels",
                    "description": "Explore uniquely curated special tours covering Nepal's majestic landscapes, heritage sites, and wildlife.",
                    "url": "https://www.newroadtravels.com/tours",
                    "provider": { "@type": "TravelAgency", "name": "New Road Travels", "url": "https://www.newroadtravels.com" }
                }}
            />
            
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <DotPattern
                    className={cn(
                        "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
                    )}
                />
            </div>

            <div className="relative z-10 w-full pt-[80px] md:pt-[100px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Story Updates */}
                <div className="mb-12">
                    <StoryUpdates />
                </div>

                {/* Tour Packages Section */}
                <section>
                    <BlurFade delay={0.4} inView>
                        <h2 className="text-2xl font-bold mb-8 text-slate-900 flex items-center gap-3">
                            <span className="w-8 h-1 bg-red-600 rounded-full"></span>
                            Discover Our Tours
                        </h2>
                    </BlurFade>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {toursData.map((tour, index) => (
                            <BlurFade delay={0.4 + (index * 0.05)} inView key={tour.slug || tour.title}>
                                <div 
                                    onClick={() => handleDestinationClick(tour.slug)}
                                    className="relative group rounded-2xl overflow-hidden cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="w-full h-[320px] overflow-hidden relative">
                                        <img
                                            src={tour.imageSrc}
                                            alt={tour.title}
                                            className="w-full h-full object-cover group-hover:scale-110 duration-700 transition-transform ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80"></div>
                                    </div>
                                    
                                    {/* Hover "View" pill */}
                                    <div className="absolute top-4 left-4 flex h-[32px] w-[32px] items-center justify-center gap-1.5 overflow-hidden rounded-full bg-black/40 backdrop-blur-md transition-all duration-300 group-hover:w-[90px] border border-white/10">
                                        <Eye className="w-4 h-4 text-white shrink-0 ml-1" />
                                        <span className="text-white text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ml-0.5">View</span>
                                    </div>

                                    {/* Title area */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <h3 className="font-bold text-lg text-white line-clamp-2 leading-snug drop-shadow-md">
                                            {tour.title}
                                        </h3>
                                    </div>
                                </div>
                            </BlurFade>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Tours;


