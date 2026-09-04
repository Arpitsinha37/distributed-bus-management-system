import Link from 'next/link';
import { Bus } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-slate-50">
      {/* Scenic banner above footer */}
      <div
        className="relative w-full h-[300px] md:h-[400px] bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/scenic-road.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-black/40 to-slate-50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-[0.6875rem] font-semibold text-[#E31837] uppercase tracking-[0.2em] mb-4">
            Your Journey Awaits
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to explore?
          </h2>
          <Link href="/" className="btn-accent">
            Book Your Ride
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
            >
              <path
                d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
                fill="#ffffff"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-[90rem] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link
              href="/"
              className="flex items-center gap-3 mb-6 group"
            >
              <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center overflow-hidden bg-white">
                <Bus className="w-5 h-5 text-[#E31837]" />
              </div>
              <span className="text-[0.9375rem] font-semibold text-slate-800 tracking-wide font-display">
                Chitwan Travels
              </span>
            </Link>
            <p className="text-[0.875rem] text-slate-500 leading-relaxed max-w-xs">
              Premium VIP Sofa Bus travel between Chitwan and Kathmandu. 
              Real-time seat selection, instant confirmations, and scenic highway views.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  Book a Bus
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  Track Ticket
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation"
                  className="text-[0.875rem] text-slate-600 hover:text-[#E31837] transition-colors duration-300"
                >
                  Cancellation
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="md:col-span-4 md:text-right">
            <h4 className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-5">
              Ready to Travel?
            </h4>
            <p className="text-[0.875rem] text-slate-500 mb-6">
              Book your next premium journey in seconds.
            </p>
            <Link href="/" className="btn-accent text-[0.6875rem]">
              Book Now
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
              >
                <path
                  d="M8 0C8 0 7.32 2.42 7.32 4C7.32 5.58 8 8 8 8C8 8 5.58 7.32 4 7.32C2.42 7.32 0 8 0 8C0 8 .68 5.58 .68 4C.68 2.42 0 0 0 0C0 0 2.42 .68 4 .68C5.58 .68 8 0 8 0Z"
                  fill="#ffffff"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.75rem] text-slate-400">
            &copy; {new Date().getFullYear()} Chitwan Travels. All rights
            reserved.
          </p>
          <p className="text-[0.75rem] text-slate-400">
            Chitwan &mdash; Kathmandu &bull; Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}
