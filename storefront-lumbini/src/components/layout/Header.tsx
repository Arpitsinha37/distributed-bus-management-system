'use client';

import Link from 'next/link';
import { Bus, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden group-hover:border-[#D4831E]/50 transition-colors duration-300 bg-white ${scrolled ? 'border-slate-200' : 'border-white/20'}`}>
            <Bus className="w-5 h-5 text-[#D4831E]" />
          </div>
          <span className={`text-[0.9375rem] font-semibold tracking-wide font-display ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            Lumbini Express
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#D4831E]' : 'text-white/80 hover:text-white'}`}
          >
            Book
          </Link>
          <Link
            href="/about"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#D4831E]' : 'text-white/80 hover:text-white'}`}
          >
            About
          </Link>
          <Link
            href="/track"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#D4831E]' : 'text-white/80 hover:text-white'}`}
          >
            Track
          </Link>
          <Link
            href="/contact"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#D4831E]' : 'text-white/80 hover:text-white'}`}
          >
            Contact
          </Link>

          {/* CTA - Track Booking */}
          <Link
            href="/track"
            className="flex items-center gap-2 py-2 px-5 bg-gradient-to-r from-[#D4831E] to-[#B91030] hover:from-[#B91030] hover:to-[#9A0D28] text-white rounded-full text-[13px] font-bold transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.97]"
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
            className="flex items-center gap-1.5 py-1.5 px-3 bg-orange-50/20 hover:bg-orange-50 text-white hover:text-[#D4831E] rounded-lg text-xs font-bold transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4831E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4831E]"></span>
            </span>
            <span>Track</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 transition-colors ${scrolled ? 'text-slate-600 hover:text-[#D4831E]' : 'text-white/80 hover:text-white'}`}
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
            className="block text-[0.9375rem] text-slate-600 hover:text-[#D4831E] transition-colors"
          >
            Book
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#D4831E] transition-colors"
          >
            About
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#D4831E] transition-colors"
          >
            Track
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#D4831E] transition-colors"
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
