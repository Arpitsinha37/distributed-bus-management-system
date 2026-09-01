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
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden group-hover:border-[#E31837]/50 transition-colors duration-300 bg-white ${scrolled ? 'border-slate-200' : 'border-white/20'}`}>
            <img src="/android-chrome-192x192.png" alt="Pokhara Travels Logo" className="w-full h-full object-cover p-1" />
          </div>
          <span className={`text-[0.9375rem] font-semibold tracking-wide font-display ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            Pokhara Travels
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            Book
          </Link>
          <Link
            href="/about"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            About
          </Link>
          <Link
            href="/track"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            Track
          </Link>
          <Link
            href="/contact"
            className={`text-[0.8125rem] font-medium transition-colors duration-300 tracking-wide ${scrolled ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
          >
            Contact
          </Link>

          {/* CTA */}
          <Link href="/#search-section" className="btn-accent text-[0.6875rem]">
            Explore
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
                fill="#0D2E37"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile burger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 transition-colors ${scrolled ? 'text-slate-600 hover:text-[#E31837]' : 'text-white/80 hover:text-white'}`}
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
            href="/about"
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
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="block text-[0.9375rem] text-slate-600 hover:text-[#E31837] transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/#search-section"
            onClick={() => setMobileOpen(false)}
            className="btn-accent text-[0.6875rem] mt-4"
          >
            Explore
          </Link>
        </div>
      )}

      {/* Bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </nav>
  );
}
