'use client';

import Link from 'next/link';
import { Bus, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isDark = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[90rem] mx-auto flex items-center justify-between py-5 px-6 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden group-hover:border-[#E31837]/50 transition-colors duration-300 bg-white ${isDark ? 'border-slate-200' : 'border-white/20'}`}>
            <Bus className="w-5 h-5 text-[#E31837]" />
          </div>
          <span className={`text-[0.9375rem] font-semibold tracking-wide font-display ${isDark ? 'text-slate-900' : 'text-white'}`}>
            Chitwan Travels
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/content/about" className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${isDark ? "text-slate-600 hover:text-[#E31837]" : "text-white/80 hover:text-white"}`}>Content</Link>
          <Link
            href="/content/about"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${isDark ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            About
          </Link>
          <Link
            href="/track"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${isDark ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            Track
          </Link>
          <Link
            href="/content/contact"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${isDark ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            Contact
          </Link>

          {/* CTA - Track Booking */}
          <Link
            href="/track"
            className="flex items-center gap-2 py-2 px-5 bg-gradient-to-r from-[#E31837] to-[#B91030] hover:from-[#B91030] hover:to-[#9A0D28] text-white rounded-full text-[13px] font-bold transition-all shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.97]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span>Track Booking</span>
          </Link>
        </div>

        {/* Mobile burger & Track */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/track"
            className="flex items-center gap-1.5 py-1.5 px-3 bg-red-50/20 hover:bg-red-50 text-white hover:text-[#E31837] rounded-lg text-xs font-bold transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E31837] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E31837]"></span>
            </span>
            <span>Track</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 transition-colors ${isDark ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-6 space-y-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"
          >
            Book
          </Link>
          <Link
            href="/content/about"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"
          >
            About
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"
          >
            Track
          </Link>
          <Link
            href="/content/contact"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"
          >
            Contact
          </Link>

        </div>
      )}

      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </nav>
  );
}

