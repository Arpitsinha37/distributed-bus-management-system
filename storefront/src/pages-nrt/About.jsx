import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Globe, Clock, Users, Leaf, Bus, Briefcase, Camera } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';
// ── Cloudinary CDN URLs (auto-optimized: format, quality, size) ──
const CDN = 'https://res.cloudinary.com/dealfp76k/image/upload/f_auto,q_auto';
const VipBusImg = `${CDN}/newroadtravels/photos/vip-sofa-bus`;
const SofaBusImg = `${CDN}/newroadtravels/photos/Sofa-Bus-Nepal-2`;
const SuperDeluxeImg = `${CDN}/newroadtravels/photos/super-deluxe`;
const KathmanduCarImg = `${CDN}/newroadtravels/photos/kathmandu-car`;
const MustangRouteImg = `${CDN}/newroadtravels/photos/mustangroute`;
const LumbiniRouteImg = `${CDN}/newroadtravels/photos/lumbiniroute`;
import { BentoCard, BentoGrid } from '@/components/nrt/ui/bento-grid';
import api from '../lib/api';
import { getImageUrl } from '../lib/utils';

const bentoFeatures = [
    {
        Icon: Globe,
        name: "Holiday Packages",
        description: "Custom trips for fun, adventure, or relaxation.",
        href: "/",
        cta: "Explore options",
        background: <img src={MustangRouteImg} className="absolute right-0 top-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 h-full w-full object-cover" alt="Nepal Holiday Packages" />,
        className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    },
    {
        Icon: Bus,
        name: "Hotels & Bus Booking",
        description: "Easy bookings at good prices.",
        href: "/",
        cta: "Book now",
        background: <img src={SuperDeluxeImg} className="absolute right-0 top-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 h-full w-full object-cover" alt="Hotels and Bus Booking" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    },
    {
        Icon: Briefcase,
        name: "Business Travel",
        description: "Smooth work trips with no stress.",
        href: "/",
        cta: "Learn more",
        background: <img src={KathmanduCarImg} className="absolute right-0 top-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 h-full w-full object-cover" alt="Business Travel in Kathmandu" />,
        className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
        Icon: Camera,
        name: "Special Tours",
        description: "Unique cultural, food, or nature experiences.",
        href: "/tours",
        cta: "Discover tours",
        background: <img src={LumbiniRouteImg} className="absolute right-0 top-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300 h-full w-full object-cover" alt="Nepal Special Tours" />,
        className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-4",
    },
];

const About = () => {
    const [about, setAbout] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [team, setTeam] = useState([]);

    useEffect(() => {
        api.getAbout().then(data => {
            if (Array.isArray(data) && data.length > 0) setAbout(data[0]);
        }).catch(() => { });

        api.getAchievements().then(data => {
            if (Array.isArray(data)) setAchievements(data);
        }).catch(() => { });

        api.getTeam().then(data => {
            if (Array.isArray(data)) setTeam(data);
        }).catch(() => { });
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <SEOHead
                title="About Us - Nepal's Trusted Travel Partner"
                description="Learn about New Road Travels — Nepal's trusted travel company with 10+ years of experience and 50,000+ happy travelers. Safe, comfortable journeys guaranteed."
                path="/about"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "TravelAgency",
                    "name": "New Road Travels",
                    "url": "https://www.newroadtravels.com",
                    "logo": "https://www.newroadtravels.com/og-default.png",
                    "telephone": "+977-9856068470",
                    "email": "nrttour@gmail.com",
                    "address": { "@type": "PostalAddress", "streetAddress": "Tourist Bus Park, Sorhakhutte", "addressLocality": "Kathmandu", "addressCountry": "NP" },
                    "sameAs": ["https://facebook.com/newroadtravels", "https://instagram.com/newroadtravels"]
                }}
            />
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <img
                    src={VipBusImg}
                    alt="New Road Travels Luxury Bus"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg font-serif">Welcome to <br /> <span className="text-nepal-red">Newroad Travels</span></h1>
                    <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide">Your Journey Begins Here</p>
                </div>
            </div>

            {/* Who We Are & Intro */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-nepal-red font-bold uppercase tracking-wider text-sm mb-2 block">Who We Are</span>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            {about?.title || <>We help you <span className="text-nepal-blue">explore the world</span> easily.</>}
                        </h2>
                        {about?.content ? (
                            <div
                                className="prose prose-slate prose-lg mb-8 text-slate-600 leading-relaxed max-w-none prose-a:text-nepal-red"
                                dangerouslySetInnerHTML={{ __html: about.content }}
                            />
                        ) : (
                            <>
                                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                    Newroad Travels is a friendly travel company dedicated to crafting unforgettable journeys.
                                    Whether it’s a family vacation, business trip, or solo adventure, we plan custom trips just for you.
                                </p>
                                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                    At Newroad Travels, we believe every journey should be unforgettable. Whether you're dreaming of a relaxing beach getaway,
                                    an adventurous trek through the mountains, or a culturally rich city tour, we’re here to turn your travel dreams into reality.
                                </p>
                            </>
                        )}
                        <div className="flex gap-4 flex-wrap">
                            {achievements.length > 0 ? achievements.map((ach) => (
                                <div key={ach.id} className="flex flex-col border-l-4 border-nepal-red pl-4 min-w-[120px]">
                                    <span className="font-bold text-3xl text-slate-900">{ach.value}</span>
                                    <span className="text-slate-500">{ach.label}</span>
                                </div>
                            )) : (
                                <>
                                    <div className="flex flex-col border-l-4 border-nepal-red pl-4">
                                        <span className="font-bold text-3xl text-slate-900">10+</span>
                                        <span className="text-slate-500">Years Experience</span>
                                    </div>
                                    <div className="flex flex-col border-l-4 border-nepal-blue pl-4">
                                        <span className="font-bold text-3xl text-slate-900">50k+</span>
                                        <span className="text-slate-500">Happy Travelers</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-nepal-red/5 rounded-2xl transform rotate-3"></div>
                        <img
                            src={about?.image || SofaBusImg}
                            alt="Comfortable Travel"
                            className="relative rounded-2xl shadow-2xl w-full object-cover h-[500px]"
                        />
                    </div>
                </div>
            </section>

            {/* Meet Our Team */}
            {team.length > 0 && (
                <section className="py-20 px-4 max-w-7xl mx-auto bg-white">
                    <div className="text-center mb-16">
                        <span className="text-nepal-red font-bold uppercase tracking-wider text-sm mb-2 block">Our Experts</span>
                        <h2 className="text-3xl font-bold text-slate-900">Meet Our Team</h2>
                        <div className="w-16 h-1 bg-nepal-blue mx-auto mt-4 mb-4"></div>
                        <p className="text-slate-600 max-w-2xl mx-auto">The dedicated professionals ensuring your journeys are safe and memorable.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {team.map(member => (
                            <div key={member.id} className="group flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 text-center">
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md relative">
                                    {member.image ? (
                                        <img src={getImageUrl(member.image)} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                            <Users size={32} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                                <p className="text-nepal-red font-semibold text-sm mb-3">{member.position}</p>
                                <div
                                    className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3 prose prose-sm prose-p:my-0"
                                    dangerouslySetInnerHTML={{ __html: member.description || '' }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* What We Do */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">What We Do</h2>
                        <div className="w-16 h-1 bg-nepal-red mx-auto mt-4 mb-4"></div>
                        <p className="text-slate-600 max-w-2xl mx-auto">We make travel simple by offering personalized services for every need.</p>
                    </div>

                    <BentoGrid className="lg:grid-rows-3 max-w-5xl mx-auto">
                        {bentoFeatures.map((feature) => (
                            <BentoCard key={feature.name} {...feature} />
                        ))}
                    </BentoGrid>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    <div className="lg:w-1/2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-nepal-blue text-white p-6 rounded-2xl rounded-br-[4rem] flex flex-col justify-center h-48">
                                <Leaf className="w-10 h-10 mb-4" />
                                <h4 className="font-bold text-lg">Eco-Friendly</h4>
                                <p className="text-sm opacity-80">Sustainable travel options.</p>
                            </div>
                            <div className="bg-slate-100 p-6 rounded-2xl rounded-tl-[4rem] flex flex-col justify-center h-48">
                                <ShieldCheck className="w-10 h-10 mb-4 text-nepal-red" />
                                <h4 className="font-bold text-lg text-slate-900">Safe & Secure</h4>
                                <p className="text-sm text-slate-500">Verified partners only.</p>
                            </div>
                            <div className="bg-slate-100 p-6 rounded-2xl rounded-bl-[4rem] flex flex-col justify-center h-48">
                                <Heart className="w-10 h-10 mb-4 text-nepal-red" />
                                <h4 className="font-bold text-lg text-slate-900">Tailored For You</h4>
                                <p className="text-sm text-slate-500">Custom itineraries.</p>
                            </div>
                            <div className="bg-nepal-red text-white p-6 rounded-2xl rounded-tr-[4rem] flex flex-col justify-center h-48">
                                <Clock className="w-10 h-10 mb-4" />
                                <h4 className="font-bold text-lg">24/7 Support</h4>
                                <p className="text-sm opacity-80">Always here to help.</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Why Choose Newroad Travels?</h2>
                        <ul className="space-y-6">
                            {[
                                { title: "Personalized Trips", desc: "Your trip, your way. We craft experiences that match your dreams." },
                                { title: "Trusted Local Experts", desc: "Real guides, real experiences. Our team knows the hidden gems." },
                                { title: "Fair Prices", desc: "Great trips without overspending. Exclusive deals and value-packed offers." },
                                { title: "Trusted Partnerships", desc: "Reliable vendors and verified accommodations for your peace of mind." }
                            ].map((item, index) => (
                                <li key={index} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                                        <p className="text-slate-600 text-sm">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Our Promise CTA */}
            <section className="bg-nepal-blue py-20 px-4 text-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 font-serif">Let’s Travel Together!</h2>
                    <p className="text-xl opacity-90 mb-10">Whether you're a solo explorer, a couple on a romantic escape, or a family seeking fun-filled adventures, Newroad Travels is your trusted companion on the road less traveled.</p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-10">
                        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                            <span className="text-2xl">📞</span>
                            <span className="font-bold text-lg">+977 9856068470</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                            <span className="text-2xl">✉️</span>
                            <span className="font-bold text-lg">nrttour@gmail.com</span>
                        </div>
                    </div>

                    <button className="px-10 py-4 bg-nepal-red hover:bg-red-600 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-red-900/50 transition-all transform hover:-translate-y-1">
                        Contact Us Today
                    </button>
                </div>
            </section>
        </div>
    );
};

export default About;


