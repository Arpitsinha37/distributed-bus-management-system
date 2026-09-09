import React, { useState } from 'react';
import { Map, Marker, ZoomControl } from 'pigeon-maps';
import { Navigation, MapPin, Phone, Mail, Clock } from 'lucide-react';
import SEOHead from '../components/nrt/SEOHead';

const Location = () => {
    // Exact Coordinates from User's Google Maps Link
    const officeLocation = [27.7179044, 85.3070348];

    // State
    const [center, setCenter] = useState(officeLocation);
    const [zoom, setZoom] = useState(16);
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGetDirections = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const newLocation = [userLat, userLng];

                setUserLocation(newLocation);

                // Calculate center point between user and office to show both
                const midLat = (userLat + officeLocation[0]) / 2;
                const midLng = (userLng + officeLocation[1]) / 2;

                setCenter([midLat, midLng]);
                setZoom(13); // Zoom out to show the relationship between points
                setLoading(false);
            },
            (err) => {
                console.error("Geolocation Error:", err);
                let msg = "Unable to retrieve location.";
                if (err.code === 1) msg = "Location permission denied. Please allow access in browser settings.";
                else if (err.code === 2) msg = "Location unavailable. Please check your GPS.";
                else if (err.code === 3) msg = "Location request timed out.";
                setError(msg);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="min-h-screen bg-white pt-20">
            <SEOHead
                title="Our Branch Locations & Contact"
                description="Find New Road Travels office at Tourist Bus Park, Sorhakhutte, Kathmandu. Get directions, phone numbers, and opening hours."
                path="/location"
            />
            {/* Header */}
            <div className="bg-slate-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Find Us</h1>
                    <p className="text-slate-400">Visit our office at Tourist Bus Park, Sorhakhutte.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Info Card */}
                    <div className="lg:col-span-1 h-fit">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin className="text-nepal-red" /> Contact Info
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2">Office Location</h3>
                                    <p className="text-slate-600">New Road Travels & Tours</p>
                                    <p className="text-slate-600">Tourist Bus Park, Sorhakhutte</p>
                                    <p className="text-slate-600">Kathmandu, Nepal</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone</h3>
                                    <p className="text-slate-600">9856068470</p>
                                    <p className="text-slate-600">+977 1 4XXXXXX</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</h3>
                                    <p className="text-slate-600">nrttour@gmail.com</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Opening Hours</h3>
                                    <p className="text-slate-600">Sun - Fri: 9:00 AM - 6:00 PM</p>
                                    <p className="text-slate-600">Sat: 10:00 AM - 2:00 PM</p>
                                </div>
                            </div>

                            <button
                                onClick={handleGetDirections}
                                disabled={loading}
                                className="w-full mt-8 bg-nepal-blue hover:bg-blue-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Navigation className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Locating...' : 'Get Directions from My Location'}
                            </button>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Section - Pigeon Maps */}
                    <div className="lg:col-span-2 h-[600px] bg-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative z-0">
                        <Map
                            height={600}
                            center={center}
                            zoom={zoom}
                            onBoundsChanged={({ center, zoom }) => {
                                setCenter(center);
                                setZoom(zoom);
                            }}
                        >
                            <ZoomControl />

                            {/* Office Marker - Red */}
                            <Marker
                                width={50}
                                anchor={officeLocation}
                                color="#DC143C"
                                onClick={() => {
                                    setCenter(officeLocation);
                                    setZoom(17);
                                }}
                            />

                            {/* User Marker - Blue (if available) */}
                            {userLocation && (
                                <Marker
                                    width={50}
                                    anchor={userLocation}
                                    color="#003893"
                                    onClick={() => {
                                        setCenter(userLocation);
                                        setZoom(17);
                                    }}
                                />
                            )}
                        </Map>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Location;


