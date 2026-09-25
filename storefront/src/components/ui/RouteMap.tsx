'use client';

import React from 'react';
import { Map, Marker, ZoomControl, Overlay } from 'pigeon-maps';
import { MapPin } from 'lucide-react';

const RouteMap = () => {
  // Approximate coordinates
  const pokhara: [number, number] = [28.2096, 83.9856];
  const kathmandu: [number, number] = [27.7172, 85.3240];
  const center: [number, number] = [27.9634, 84.6548]; // Midpoint roughly

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 relative group">
      <Map height={400} defaultCenter={center} defaultZoom={8}>
        <ZoomControl />
        
        {/* Pokhara Marker */}
        <Marker width={50} anchor={pokhara}>
            <div className="flex flex-col items-center transform -translate-y-1/2">
                <div className="bg-[#E31837] text-white p-1.5 rounded-full shadow-lg">
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="bg-white text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-md mt-1 border border-slate-200">
                    Pokhara
                </div>
            </div>
        </Marker>

        {/* Kathmandu Marker */}
        <Marker width={50} anchor={kathmandu}>
             <div className="flex flex-col items-center transform -translate-y-1/2">
                <div className="bg-[#E31837] text-white p-1.5 rounded-full shadow-lg">
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="bg-white text-slate-800 text-xs font-bold px-2 py-1 rounded shadow-md mt-1 border border-slate-200">
                    Kathmandu
                </div>
            </div>
        </Marker>
      </Map>
      
      {/* Route Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg pointer-events-none transition-opacity duration-300">
          <div className="flex items-center justify-between text-slate-800">
              <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Distance</span>
                  <span className="font-display font-bold text-lg">~200 km</span>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Route</span>
                  <span className="font-display font-bold text-lg text-[#E31837]">Prithvi Highway</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default RouteMap;
