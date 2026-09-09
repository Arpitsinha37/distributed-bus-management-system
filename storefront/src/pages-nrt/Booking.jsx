import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Info, Snowflake, Wifi, Droplets, BedDouble, MapPin, Bus, Tag, ChevronRight } from 'lucide-react';
import SeatMap from '../components/nrt/SeatMap';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';

// ── Premium Transit System Colors ──
const C = {
    surface: '#fcf9f8',
    surfaceContainer: '#f0eded',
    surfaceVariant: '#e5e2e1',
    surfaceContainerLowest: '#ffffff',
    onSurface: '#1c1b1b',
    onSurfaceVariant: '#5c3f3f',
    outline: '#916f6e',
    outlineVariant: '#e6bdbc',
    primary: '#b1002c',
    primaryContainer: '#dc143c',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#fff1f0',
    secondary: '#335ab4',
    secondaryContainer: '#7da0ff',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
};

const Booking = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { tripData, source, destination, date } = location.state || {};

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [holdingInProgress, setHoldingInProgress] = useState(false);
    const [error, setError] = useState(null);

    // Parse trip data
    const seatLayout = tripData?.SeatLayoutt || [];
    const noofrow = tripData?.noofrow || 8;
    const noofcolumn = tripData?.noofcolumn || 5;
    const price = Number(tripData?.Price) || 0;
    const companyName = tripData?.CompanyName || '';
    const busType = tripData?.type || '';
    const departureTime = tripData?.time || '';
    const pickupPoints = tripData?.from_location1 || [];
    const dropPoints = tripData?.Drop || [];
    const amenities = tripData?.Amenities || '';
    const cashback = Number(tripData?.Cashback) || 0;

    // Build seats array
    const seats = seatLayout.map((s, idx) => ({
        ...s,
        index: idx,
        row: Math.floor(idx / noofcolumn),
        col: idx % noofcolumn,
    }));

    const handleSeatClick = (seat) => {
        if (seat.displayName === 'na') return;
        if (seat.bookingStatus === 'No') return;
        const seatId = seat.displayName;
        setSelectedSeats(prev =>
            prev.includes(seatId)
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    const handleProceed = async () => {
        if (selectedSeats.length === 0) return;
        setHoldingInProgress(true);
        setError(null);

        try {
            const seatStr = selectedSeats.join(',');
            const result = await api.busPortal.holdSeats(seatStr, String(selectedSeats.length), tripData.busno);

            if (result.code === '1' && result.data) {
                navigate('/passenger-details', {
                    state: {
                        ticketNo: result.data,
                        tripData,
                        selectedSeats,
                        price,
                        source: source || tripData.from_id,
                        destination: destination || tripData.to_id,
                        date: date || tripData.date,
                        pickupPoints,
                        dropPoints,
                        cashback,
                    },
                });
            } else {
                setError(result.message || result.data || 'Failed to hold seats. Try again.');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to hold seats.');
        } finally {
            setHoldingInProgress(false);
        }
    };

    if (!tripData) {
        return (
            <div className="pt-24 px-4 text-center min-h-[70vh] flex flex-col justify-center items-center" style={{ background: C.surface, fontFamily: 'Inter, sans-serif' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: C.surfaceContainer }}>
                    <Bus className="w-8 h-8" style={{ color: C.primary }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: C.onSurface }}>Trip Not Found</h2>
                <p className="mb-8 max-w-md text-sm" style={{ color: C.onSurfaceVariant }}>The trip you are looking for might have expired. Please search again.</p>
                <button
                    onClick={() => navigate('/')}
                    className="text-white px-8 py-3 rounded-lg font-bold hover:brightness-110 transition"
                    style={{ background: C.primary }}
                >
                    Search Buses
                </button>
            </div>
        );
    }

    const totalAmount = (price - cashback) * selectedSeats.length;

    const amenitiesList = amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
    const amenityIcons = {
        'ac': <Snowflake className="w-5 h-5" />,
        'a/c': <Snowflake className="w-5 h-5" />,
        'wifi': <Wifi className="w-5 h-5" />,
        'wi-fi': <Wifi className="w-5 h-5" />,
        'water': <Droplets className="w-5 h-5" />,
        'blanket': <BedDouble className="w-5 h-5" />,
    };

    return (
        <div className="min-h-screen flex flex-col pt-24 pb-32 md:pb-8" style={{ background: C.surface, color: C.onSurface, fontFamily: 'Inter, sans-serif' }}>
            <SEOHead
                title="Select Your Seats"
                description="Choose your preferred seats and book your bus ticket with New Road Travels."
                noIndex={true}
            />

            {/* ═══ Top App Bar — Premium Theme ═══ */}
            <header className="fixed top-0 w-full z-50 flex flex-col px-6 py-4 transition-all duration-300 shadow-sm" style={{ background: C.surface }}>
                <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="transition-colors rounded-full p-2 flex items-center justify-center"
                        style={{ color: C.onSurfaceVariant }}
                        onMouseEnter={e => e.currentTarget.style.background = C.surfaceVariant}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-lg sm:text-2xl font-bold tracking-tight" style={{ color: C.onSurface }}>
                            {source || tripData.from_id} to {destination || tripData.to_id}
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold tracking-wide mt-0.5" style={{ color: C.onSurfaceVariant, letterSpacing: '0.05em' }}>
                            {date || tripData.date} • {departureTime}
                        </p>
                    </div>
                    <button
                        className="transition-colors rounded-full p-2 flex items-center justify-center"
                        style={{ color: C.onSurfaceVariant }}
                        onMouseEnter={e => e.currentTarget.style.background = C.surfaceVariant}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* ═══ Main Content ═══ */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-6 md:gap-8 mt-4">
                
                {/* Left Column: Details & Legend */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 order-2 md:order-1">
                    
                    {/* Bus Details Card */}
                    <div className="rounded-xl border shadow-sm p-6 relative overflow-hidden group" style={{ background: C.surface, borderColor: C.surfaceVariant }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700 ease-in-out" style={{ background: `${C.primary}0d` }} />
                        <h2 className="text-xl font-semibold mb-1" style={{ color: C.onSurface }}>{companyName}</h2>
                        <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>{busType} • Departs {departureTime}</p>
                        
                        {/* Amenities Grid */}
                        {amenitiesList.length > 0 && (
                            <div className="flex justify-between items-center border-t pt-4" style={{ borderColor: C.surfaceVariant }}>
                                {amenitiesList.slice(0, 4).map((a, i) => {
                                    const iconKey = a.toLowerCase();
                                    const icon = amenityIcons[iconKey] || <Bus className="w-5 h-5" />;
                                    return (
                                        <div className="flex flex-col items-center gap-1.5" style={{ color: C.onSurface }} key={i}>
                                            {icon}
                                            <span className="text-xs font-medium capitalize">{a}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Price Badge */}
                        <div className="mt-5 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.surfaceContainer }}>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.onSurfaceVariant }}>Per seat</div>
                                <div className="text-2xl font-bold" style={{ color: C.primary }}>रू {price}</div>
                            </div>
                            {cashback > 0 && (
                                <div className="text-right">
                                    <div className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>Cashback</div>
                                    <div className="text-lg font-bold" style={{ color: '#705200' }}>रू {cashback}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop Booking Summary */}
                    <div className="hidden lg:block rounded-xl border shadow-sm p-6 sticky top-24" style={{ background: C.surface, borderColor: C.surfaceVariant }}>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.05em] mb-4 pb-3 border-b" style={{ color: C.onSurface, borderColor: C.surfaceVariant }}>
                            Booking Summary
                        </h3>
                        <div className="space-y-3 text-sm mb-5">
                            <div className="flex justify-between">
                                <span style={{ color: C.onSurfaceVariant }}>Selected Seats</span>
                                <span className="font-bold" style={{ color: C.onSurface }}>
                                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: C.onSurfaceVariant }}>No. of Seats</span>
                                <span className="font-medium" style={{ color: C.onSurface }}>{selectedSeats.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: C.onSurfaceVariant }}>Price × {selectedSeats.length}</span>
                                <span className="font-medium" style={{ color: C.onSurface }}>रू {price * selectedSeats.length}</span>
                            </div>
                            {cashback > 0 && selectedSeats.length > 0 && (
                                <div className="flex justify-between" style={{ color: '#705200' }}>
                                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Cashback</span>
                                    <span>- रू {cashback * selectedSeats.length}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-4 border-t mb-5" style={{ borderColor: C.surfaceVariant }}>
                            <span style={{ color: C.onSurface }}>Total</span>
                            <span style={{ color: C.primary }}>NPR {totalAmount.toLocaleString()}</span>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl text-xs border" style={{ background: C.errorContainer, borderColor: '#ffb3b3', color: '#93000a' }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleProceed}
                            disabled={selectedSeats.length === 0 || holdingInProgress}
                            className="w-full text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:translate-y-0.5 duration-150"
                            style={{ background: selectedSeats.length === 0 ? C.outline : C.primary, letterSpacing: '0.05em' }}
                        >
                            {holdingInProgress ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Holding Seats...
                                </span>
                            ) : (
                                <>
                                    <span>Proceed to Payment</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-center mt-2" style={{ color: C.outline }}>Seats are held for 10 min after proceeding</p>
                    </div>
                </div>

                {/* Right Column: Seat Map */}
                <div className="w-full md:w-2/3 order-1 md:order-2 flex justify-center">
                    <div className="w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>Select Your Seats</h3>
                            {selectedSeats.length > 0 && (
                                <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#ffdad9', color: '#920022' }}>
                                    {selectedSeats.length} selected
                                </span>
                            )}
                        </div>
                        <SeatMap
                            seats={seats}
                            selectedSeats={selectedSeats}
                            onSeatClick={handleSeatClick}
                            price={price}
                            noofcolumn={noofcolumn}
                        />
                    </div>
                </div>
            </main>

            {/* ═══ Mobile Bottom Nav Bar ═══ */}
            <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-between items-center px-6 py-4 shadow-[0_-4px_12px_rgba(8,28,54,0.04)] rounded-t-xl left-1/2 -translate-x-1/2 max-w-7xl" style={{ background: C.surfaceContainerLowest }}>
                {error && (
                    <div className="absolute -top-12 left-4 right-4 p-2 rounded-lg text-xs text-center border" style={{ background: C.errorContainer, borderColor: '#ffb3b3', color: '#93000a' }}>
                        {error}
                    </div>
                )}
                <div className="flex flex-col items-start justify-center">
                    <span className="text-sm font-semibold" style={{ color: C.onSurface, letterSpacing: '0.05em' }}>
                        Total: NPR {totalAmount.toLocaleString()}
                    </span>
                    <span className="text-sm" style={{ color: C.onSurfaceVariant }}>
                        {selectedSeats.length > 0
                            ? `${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''} Selected (${selectedSeats.join(', ')})`
                            : 'Select seats to continue'}
                    </span>
                </div>
                <button
                    onClick={handleProceed}
                    disabled={selectedSeats.length === 0 || holdingInProgress}
                    className="flex flex-row items-center justify-center text-white rounded-lg px-6 py-3 gap-2 hover:brightness-110 transition-all active:translate-y-0.5 duration-150 group disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: selectedSeats.length === 0 ? C.outline : C.primary, letterSpacing: '0.05em' }}
                >
                    <span className="text-sm font-bold">
                        {holdingInProgress ? 'Holding...' : 'Proceed to Payment'}
                    </span>
                    {!holdingInProgress && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
            </nav>
        </div>
    );
};

export default Booking;


