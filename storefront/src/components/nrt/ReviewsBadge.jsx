import React from 'react';
import { Star } from 'lucide-react';

const ReviewsBadge = () => {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Google Reviews */}
            <a
                href="https://share.google/C9gymODmgKWmzFyBR"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 transition-all duration-300 group border border-white/10 hover:border-white/20"
            >
                <div className="flex-shrink-0">
                    <svg viewBox="0 0 24 24" width="28" height="28" className="drop-shadow-sm">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        ))}
                        <span className="text-white font-bold text-sm ml-1">4.9</span>
                    </div>
                    <p className="text-white/60 text-xs font-medium group-hover:text-white/80 transition-colors">Google Reviews</p>
                </div>
            </a>

            {/* TripAdvisor */}
            <a
                href="https://www.tripadvisor.com/Attraction_Review-g293890-d17625441-Reviews-New_road_Travels_and_Tour_Pvt_Ltd-Kathmandu_Kathmandu_Valley_Bagmati_Zone_Centra.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 transition-all duration-300 group border border-white/10 hover:border-white/20"
            >
                <div className="flex-shrink-0">
                    <svg viewBox="0 0 24 24" width="28" height="28">
                        <circle cx="12" cy="12" r="12" fill="#34E0A1"/>
                        <path d="M12 6.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 8 12 8s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" fill="#fff"/>
                        <circle cx="9.5" cy="12.5" r="1.5" fill="#fff"/>
                        <circle cx="14.5" cy="12.5" r="1.5" fill="#fff"/>
                        <path d="M12 5l1.5 2h-3L12 5z" fill="#fff"/>
                    </svg>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-0.5">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#34E0A1]" />
                        ))}
                        <span className="text-white font-bold text-sm ml-1">5.0</span>
                    </div>
                    <p className="text-white/60 text-xs font-medium group-hover:text-white/80 transition-colors">TripAdvisor</p>
                </div>
            </a>
        </div>
    );
};

export default ReviewsBadge;

