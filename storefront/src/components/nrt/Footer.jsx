import React, { useState, useEffect } from 'react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Twitter,
    Youtube,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ReviewsBadge from './ReviewsBadge';

/* ─── Default New Road Travels data ─── */
const defaultData = {
    facebookLink: 'https://facebook.com/newroadtravels',
    instaLink: 'https://instagram.com/newroadtravels',
    twitterLink: 'https://twitter.com/newroadtravels',
    services: {
        busBooking: '/',
        tourPackages: '/',
        rentals: '/rentals',
        tracking: '/',
    },
    about: {
        aboutUs: '/about',
        team: '/about',
        blog: '/blog',
        careers: '/about',
    },
    help: {
        faqs: '/faq',
        support: '/location',
        livechat: '/location',
    },
    contact: {
        email: 'info@newroadtravels.com',
        phone: '+977 9856068470',
        address: 'Tourist Bus Park, Sorhakhutte, Kathmandu, Nepal',
    },
    company: {
        name: 'New Road Travels',
        description:
            'Experience the beauty of Nepal with the most trusted travel partner. From the Himalayas to the Terai, we ensure your journey is safe, comfortable, and memorable.',
    },
    logoUrl: '/logo.jpeg'
};

/* ─── Premium White Footer ─── */
const Footer = () => {
    const [email, setEmail] = useState('');
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        api.getSiteSettings().then(data => {
            if (data && !data.error) setSettings(data);
        }).catch(() => { });
    }, []);

    const data = {
        ...defaultData,
        facebookLink: settings?.facebookUrl || defaultData.facebookLink,
        instaLink: settings?.instagramUrl || defaultData.instaLink,
        twitterLink: settings?.twitterUrl || defaultData.twitterLink,
        contact: {
            ...defaultData.contact,
            email: settings?.contactEmail || defaultData.contact.email,
            phone: settings?.contactPhone || defaultData.contact.phone,
            address: settings?.contactAddress || defaultData.contact.address,
        },
        company: {
            ...defaultData.company,
            name: settings?.siteName || defaultData.company.name,
            description: settings?.siteDescription || defaultData.company.description,
        },
        logoUrl: settings?.logoUrl || defaultData.logoUrl,
    };

    const socialLinks = [
        { icon: Facebook, label: 'Facebook', href: data.facebookLink },
        { icon: Instagram, label: 'Instagram', href: data.instaLink },
        { icon: Twitter, label: 'Twitter', href: data.twitterLink },
        { icon: Youtube, label: 'YouTube', href: '#' },
    ];

    const aboutLinks = [
        { text: 'About Us', href: data.about.aboutUs },
        { text: 'Our Team', href: data.about.team },
        { text: 'Blog', href: data.about.blog },
        { text: 'Careers', href: data.about.careers },
    ];

    const serviceLinks = [
        { text: 'Bus Booking', href: data.services.busBooking },
        { text: 'Tour Packages', href: data.services.tourPackages },
        { text: 'Vehicle Rentals', href: data.services.rentals },
        { text: 'Live Tracking', href: data.services.tracking },
    ];

    const helpfulLinks = [
        { text: 'FAQs', href: data.help.faqs },
        { text: 'Support', href: data.help.support },
        { text: 'Location', href: '/location' },
        { text: 'Live Chat', href: data.help.livechat, hasIndicator: true },
    ];

    const contactInfo = [
        { icon: Mail, text: data.contact.email },
        { icon: Phone, text: data.contact.phone },
        { icon: MapPin, text: data.contact.address, isAddress: true },
    ];

    const handleSubscribe = async () => {
        if (!email) return;
        try {
            await api.subscribe(email);
            alert('Subscribed successfully!');
            setEmail('');
        } catch (err) {
            alert('Subscription failed or already subscribed.');
        }
    };

    return (
        <footer className="relative w-full bg-white text-slate-800 pt-0 pb-0 overflow-hidden border-t border-slate-100">

            {/* Subtle background accents */}
            <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
                <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-nepal-red/[0.03] blur-[120px]" />
                <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/[0.03] blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* ── App Download Section ── */}
                <div className="my-12 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-slate-50 border border-blue-100/50 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
                    {/* Background decoration */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-nepal-red/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid items-center gap-12 md:grid-cols-2 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Now Available
                            </div>
                            
                            <h3 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl leading-tight">
                                Download <span className="text-blue-600">New Road Travels</span> App
                            </h3>
                            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                                The New Road Travels Passenger App makes it easy to book your bus tickets online and Vehicle rental service for popular tourist destinations. Select your preferred seat, pay securely via eSewa, Khalti, Connect IPS, Mobile Banking, Visa/Master Card and enjoy a smooth, hassle-free booking experience.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                {/* Google Play Button */}
                                <a href="https://play.google.com/store/apps/details?id=newroad.travels.passangerapp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all group border border-slate-800">
                                    <svg className="w-7 h-7 group-hover:scale-110 transition-transform text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3.197 1.838A2.697 2.697 0 0 0 2 4.15v15.7a2.697 2.697 0 0 0 1.197 2.312l10.9-10.9L3.197 1.838zM15.4 12.5l-1.306 1.306L3.456 24.443c.484.232 1.048.274 1.58.113l13.73-7.852-3.366-4.204zM16.48 11.42l3.366 4.204.912-.52c.677-.387.677-1.378 0-1.766L16.48 11.42zM14.093 11.193 3.196 1.838A2.7 2.7 0 0 1 5.035 1.56L18.766 9.412l-4.673 1.781z"/>
                                    </svg>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider leading-none mb-1">Get it on</span>
                                        <span className="text-base font-bold leading-none tracking-wide">Google Play</span>
                                    </div>
                                </a>

                                {/* App Store Button */}
                                <a href="https://play.google.com/store/apps/details?id=newroad.travels.passangerapp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all group border border-slate-800">
                                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform mb-1 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.365 14.363c-.015-3.084 2.525-4.568 2.639-4.636-1.427-2.083-3.64-2.368-4.425-2.4-1.89-.193-3.714 1.12-4.676 1.12-.977 0-2.474-1.096-4.047-1.066-2.046.03-3.935 1.185-4.986 2.996-2.122 3.69-.542 9.155 1.536 12.164 1.01 1.464 2.203 3.119 3.782 3.056 1.517-.064 2.1-.986 3.932-.986 1.817 0 2.355.986 3.962.955 1.636-.033 2.66-1.503 3.655-2.97 1.157-1.688 1.636-3.324 1.65-3.411-.036-.014-3.18-1.22-3.197-4.822zM15.016 5.234c.828-1 1.385-2.39 1.233-3.774-1.18.048-2.617.786-3.468 1.81-.762.906-1.433 2.336-1.25 3.689 1.32.103 2.658-.696 3.485-1.725z"/>
                                    </svg>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider leading-none mb-1">Download on the</span>
                                        <span className="text-base font-bold leading-none tracking-wide">App Store</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="hidden justify-center md:flex relative h-[450px] w-full max-w-sm mx-auto">
                            {/* App Screenshot 1 - Background (Seat Selection) */}
                            <div className="absolute right-2 top-8 w-[210px] h-[430px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl z-0 rotate-[6deg] hover:rotate-[10deg] transition-transform duration-500 overflow-hidden group">
                                {/* Dynamic Island */}
                                <div className="absolute top-2 inset-x-0 mx-auto w-16 h-4 bg-black rounded-full z-30 flex items-center justify-between px-1.5 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full opacity-50"></div>
                                </div>
                                {/* Screen Area */}
                                <div className="w-full h-full bg-slate-50 flex flex-col relative rounded-[2rem] overflow-hidden pt-7">
                                    {/* App Header */}
                                    <div className="bg-blue-700 text-white p-3 pt-4 pb-2 shadow-sm z-10 flex items-center">
                                        <svg className="w-4 h-4 mr-1 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                                        <h4 className="font-semibold text-xs tracking-wide">Ticket Booking</h4>
                                    </div>
                                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 bg-white text-[9px] font-medium text-slate-500 shadow-sm z-10">
                                        <div className="flex flex-col items-center"><div className="w-3.5 h-3.5 bg-green-500 rounded-sm mb-1 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"></div>Available</div>
                                        <div className="flex flex-col items-center"><div className="w-3.5 h-3.5 bg-fuchsia-500 rounded-sm mb-1 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"></div>Selected</div>
                                        <div className="flex flex-col items-center"><div className="w-3.5 h-3.5 bg-red-500 rounded-sm mb-1 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]"></div>Booked</div>
                                    </div>
                                    <div className="p-4 grid grid-cols-4 gap-x-2.5 gap-y-3.5 mx-auto mt-2 w-full max-h-[220px] overflow-hidden">
                                        {Array.from({length: 24}).map((_, i) => {
                                            const isAisle = i % 4 === 1;
                                            const isBooked = [4, 8, 9, 14].includes(i);
                                            const isSelected = i === 12;
                                            if (isAisle) return <div key={i}></div>;
                                            const bgColor = isSelected ? 'bg-fuchsia-500' : (isBooked ? 'bg-red-500' : 'bg-green-500');
                                            return (
                                                <div key={i} className={`h-8 rounded-md rounded-t-xl flex items-center justify-center text-[8px] text-white font-bold shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)] shadow-sm ${bgColor} relative`}>
                                                    <div className="absolute top-0.5 inset-x-1 h-1.5 bg-white/20 rounded-full"></div>
                                                    {isBooked ? 'B' : 'A'}{Math.floor(i/4) + 1}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 h-[72px] bg-white border-t border-slate-200 flex flex-col p-3 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5 px-1 font-medium">
                                            <span>Seat No: A4</span>
                                            <span>Fare: Rs. 1200</span>
                                        </div>
                                        <div className="w-full h-8 bg-blue-700 rounded-lg shadow-md flex items-center justify-center text-white text-[11px] font-bold tracking-wide">Next</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* App Screenshot 2 - Foreground (Search Form) */}
                            <div className="absolute left-2 top-0 w-[220px] h-[440px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl z-10 rotate-[-4deg] hover:rotate-[-1deg] transition-transform duration-500 overflow-hidden ring-1 ring-white/10">
                                {/* Dynamic Island */}
                                <div className="absolute top-2 inset-x-0 mx-auto w-16 h-4 bg-black rounded-full z-30 flex items-center justify-between px-1.5 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-800 rounded-full opacity-50"></div>
                                </div>
                                {/* Screen Area */}
                                <div className="w-full h-full bg-white flex flex-col relative rounded-[2rem] overflow-hidden">
                                    {/* App Header */}
                                    <div className="bg-blue-700 h-16 w-full relative z-0">
                                        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "8px 8px"}}></div>
                                    </div>
                                    <div className="flex justify-center -mt-8 z-10">
                                        <div className="bg-white p-1 rounded-full shadow-md">
                                            <img src={data.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-full border border-gray-100" />
                                        </div>
                                    </div>
                                    
                                    <div className="px-5 py-4 space-y-3.5 mt-1">
                                        <div className="relative">
                                            <label className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5"><MapPin className="w-3 h-3 text-blue-500"/> From</label>
                                            <div className="w-full h-8 border-b border-gray-200 text-xs font-medium flex items-center text-slate-800 px-1 hover:border-blue-400 transition-colors">Kathmandu</div>
                                        </div>
                                        <div className="relative">
                                            <label className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5"><MapPin className="w-3 h-3 text-blue-500"/> To</label>
                                            <div className="w-full h-8 border-b border-gray-200 text-xs font-medium flex items-center text-slate-400 px-1 hover:border-blue-400 transition-colors">Enter a City</div>
                                        </div>
                                        <div className="relative">
                                            <label className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">📅 Journey Date</label>
                                            <div className="w-full h-8 border border-gray-200 rounded-md text-xs font-medium text-slate-800 flex items-center px-2 hover:border-blue-400 transition-colors">Today</div>
                                        </div>
                                        
                                        <button className="w-full h-10 bg-blue-600 rounded-lg shadow-md shadow-blue-600/30 text-white font-bold text-xs tracking-wide mt-5 hover:bg-blue-700 transition-colors">SEARCH BUSES</button>
                                    </div>
                                    
                                    <div className="mt-auto bg-amber-400 p-4 flex flex-col h-28 relative overflow-hidden">
                                        <p className="text-[9px] text-blue-900 font-bold uppercase tracking-widest text-right relative z-10 opacity-80">Popular Routes</p>
                                        {/* Mock map outline */}
                                        <svg className="absolute w-[180%] h-[180%] top-6 -left-8 text-blue-900/10 stroke-blue-900/20" viewBox="0 0 100 100">
                                            <path fill="currentColor" d="M10,40 Q20,30 30,35 T50,30 T70,40 T90,30 L90,60 Q70,70 50,65 T30,60 T10,70 Z" />
                                            <circle cx="30" cy="35" r="2" fill="#1e3a8a" />
                                            <circle cx="70" cy="40" r="2" fill="#1e3a8a" />
                                            <path d="M30 35 L 70 40" fill="none" strokeDasharray="2,2" strokeWidth="1" stroke="#1e3a8a" />
                                        </svg>
                                    </div>
                                    
                                    {/* Bottom Nav */}
                                    <div className="h-14 bg-white border-t border-slate-100 w-full flex items-center justify-around px-2 z-20 pb-1 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                                        <div className="flex flex-col items-center text-blue-600">
                                            <div className="w-5 h-5 flex flex-col justify-end items-center"><div className="w-4 h-4 border-2 border-current rounded-sm"></div><div className="w-5 h-1 bg-current rounded-full mt-0.5"></div></div>
                                            <span className="text-[7px] font-bold mt-1 tracking-wider">HOME</span>
                                        </div>
                                        <div className="flex flex-col items-center text-slate-400">
                                            <div className="w-5 h-5 border-2 border-current rounded text-center leading-[14px] font-bold text-[10px]">✓</div>
                                            <span className="text-[7px] font-bold mt-1 tracking-wider">TICKETS</span>
                                        </div>
                                        <div className="flex flex-col items-center text-slate-400">
                                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center"><div className="w-2 h-2 bg-current rounded-full"></div></div>
                                            <span className="text-[7px] font-bold mt-1 tracking-wider">TRACK</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Footer Grid ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 pb-12">
                    {/* Brand Column */}
                    <div>
                        <div className="flex justify-center sm:justify-start">
                            <img src={data.logoUrl} alt={`${data.company.name} Logo`} className="h-[36px] object-contain" />
                        </div>

                        <p className="text-slate-500 mt-6 max-w-md text-center leading-relaxed sm:max-w-xs sm:text-left text-sm">
                            {data.company.description}
                        </p>

                        <ul className="mt-8 flex justify-center gap-3 sm:justify-start">
                            {socialLinks.map(({ icon: Icon, label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-nepal-red hover:text-white hover:border-nepal-red hover:shadow-md hover:shadow-red-200 transition-all duration-300"
                                    >
                                        <span className="sr-only">{label}</span>
                                        <Icon className="h-4 w-4" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
                        {/* About Us */}
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">About Us</p>
                            <ul className="space-y-3 text-sm">
                                {aboutLinks.map(({ text, href }) => (
                                    <li key={text}>
                                        <Link className="text-slate-500 hover:text-nepal-red transition-colors duration-200" to={href}>
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Our Services */}
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Our Services</p>
                            <ul className="space-y-3 text-sm">
                                {serviceLinks.map(({ text, href }) => (
                                    <li key={text}>
                                        <Link className="text-slate-500 hover:text-nepal-red transition-colors duration-200" to={href}>
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Helpful Links */}
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Helpful Links</p>
                            <ul className="space-y-3 text-sm">
                                {helpfulLinks.map(({ text, href, hasIndicator }) => (
                                    <li key={text}>
                                        <Link
                                            to={href}
                                            className={`${hasIndicator
                                                ? 'group flex justify-center gap-1.5 sm:justify-start items-center'
                                                : 'text-slate-500 hover:text-nepal-red transition-colors duration-200'
                                                }`}
                                        >
                                            <span className="text-slate-500 hover:text-nepal-red transition-colors duration-200">
                                                {text}
                                            </span>
                                            {hasIndicator && (
                                                <span className="relative flex size-2">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                                                    <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Us */}
                        <div className="text-center sm:text-left">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6">Contact Us</p>
                            <ul className="space-y-3 text-sm">
                                {contactInfo.map(({ icon: Icon, text, isAddress }) => (
                                    <li key={text}>
                                        <span className="flex items-center justify-center gap-2 sm:justify-start">
                                            <Icon className="text-nepal-red size-4 shrink-0" />
                                            {isAddress ? (
                                                <address className="text-slate-500 flex-1 not-italic leading-relaxed">
                                                    {text}
                                                </address>
                                            ) : (
                                                <span className="text-slate-500 flex-1">{text}</span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ── Reviews & Trust Badges ── */}
                <div className="border-t border-slate-200 py-8">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-white font-bold text-lg">Trusted by 50,000+ Travelers</p>
                            <p className="text-white/50 text-sm">See what our customers say about us</p>
                        </div>
                        <ReviewsBadge />
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="border-t border-slate-200 py-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} {data.company.name}. All rights reserved.
                    </p>
                    <p className="text-slate-400 text-xs font-medium">
                        Crafted By:{' '}
                        <a
                            href="mailto:contact@adfusionepal.com"
                            className="font-black text-slate-700 hover:text-nepal-red transition-colors ml-1 uppercase tracking-wide"
                        >
                            Adfusion Nepal Pvt. Ltd
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

