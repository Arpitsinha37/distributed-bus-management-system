import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Car, Map, Users, MapPin, MessageSquare, BookOpen, HelpCircle, Menu, X, ChevronRight } from 'lucide-react';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const primaryLinks = [
        { name: 'Home', icon: Bus, path: '/' },
        { name: 'Rentals', icon: Car, path: '/rentals' },
        { name: 'Tours', icon: Map, path: '/tours' },
        { name: 'About', icon: Users, path: '/about' },
    ];

    const secondaryLinks = [
        { name: 'Blog', icon: BookOpen, path: '/blog' },
        { name: 'FAQ', icon: HelpCircle, path: '/faq' },
    ];

    const allMobileLinks = [...primaryLinks, ...secondaryLinks];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <nav
                className={`fixed w-full z-50 top-0 transition-all duration-500 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-1.5 border-b border-slate-100'
                    : 'bg-white/40 backdrop-blur-xl py-3 border-b border-white/30'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">

                        {/* Logo */}
                        <div className="shrink-0">
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/nrt-logo.png" alt="New Road Travels" className="h-[40px] md:h-[48px] w-auto object-contain" />
                            </Link>
                        </div>

                        {/* Desktop Navigation & Actions — Right Aligned */}
                        <div className="hidden lg:flex items-center justify-end gap-6 flex-1">
                            <div className="flex items-center gap-1 bg-white/50 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                                {primaryLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-semibold transition-all duration-200 ${isActive(link.path)
                                            ? 'text-[#DC143C] bg-red-50/80'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                            }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        <span>{link.name}</span>
                                        {isActive(link.path) && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#DC143C] rounded-full" />
                                        )}
                                    </Link>
                                ))}

                                {/* Separator */}
                                <div className="w-px h-6 bg-slate-200 mx-2" />

                                {/* Secondary Links */}
                                {secondaryLinks.slice(0, 2).map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive(link.path)
                                            ? 'text-[#DC143C] bg-red-50/80'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span>{link.name}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Track Booking */}
                            <Link
                                to="/account"
                                className="flex items-center gap-2 py-2 px-5 bg-gradient-to-r from-[#DC143C] to-[#B91030] hover:from-[#B91030] hover:to-[#9A0D28] text-white rounded-full text-[13px] font-bold transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.97]"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                </span>
                                <span>Track Booking</span>
                            </Link>
                        </div>


                        {/* Mobile Menu Button & Mobile Track Booking */}
                        <div className="flex items-center gap-3 lg:hidden">
                            <Link
                                to="/account"
                                className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50 text-[#DC143C] rounded-lg text-xs font-bold"
                            >
                                <span>Track</span>
                            </Link>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu — Full-screen slide-in panel */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        {/* Panel Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                                <img src="/nrt-logo.png" alt="NRT" className="h-8 w-auto" />
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto pt-6 px-3">
                            <div className="space-y-0.5">
                                {allMobileLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${isActive(link.path)
                                            ? 'text-[#DC143C] bg-red-50'
                                            : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <link.icon className={`w-[18px] h-[18px] ${isActive(link.path) ? 'text-[#DC143C]' : 'text-slate-400'}`} />
                                            <span>{link.name}</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 ${isActive(link.path) ? 'text-[#DC143C]/50' : 'text-slate-300'}`} />
                                    </Link>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            )}
        </>
    );
};

export default Header;

