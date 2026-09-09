import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBus, FaMobileAlt, FaEnvelope, FaPencilAlt, FaFileInvoice, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import SEOHead from '../components/nrt/SEOHead';
import api from '../lib/api';

const PassengerDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State from Booking page
    const {
        ticketNo,
        tripData,
        selectedSeats,
        price,
        source,
        destination,
        date,
        pickupPoints = [],
        dropPoints = [],
        cashback = 0,
    } = location.state || {};

    // Redirect if no ticket number (direct access prevention)
    useEffect(() => {
        if (!ticketNo) {
            navigate('/');
        }
    }, [ticketNo, navigate]);

    // Form state
    const [passengerName, setPassengerName] = useState('');
    const [contact, setContact] = useState('');
    const [passengerEmail, setPassengerEmail] = useState('');
    const [selectedPickup, setSelectedPickup] = useState(pickupPoints[0] || '');
    const [selectedDrop, setSelectedDrop] = useState(dropPoints[0] || '');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('esewa');
    const [passengerFilled, setPassengerFilled] = useState(false); // Track if fillPassenger already succeeded
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState(null);
    const [couponSuccess, setCouponSuccess] = useState(null);

    // ── 4-minute Seat Hold Timer ──
    const HOLD_DURATION = 4 * 60; // 4 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(HOLD_DURATION);
    const [timerExpired, setTimerExpired] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!ticketNo) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setTimerExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [ticketNo]);

    // Auto-cancel hold when timer expires
    useEffect(() => {
        if (timerExpired && ticketNo) {
            api.busPortal.cancelHold(ticketNo).catch(() => {});
            alert('Your seat hold has expired. Seats have been released.');
            navigate('/', { replace: true });
        }
    }, [timerExpired, ticketNo, navigate]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const timerPercent = (timeLeft / HOLD_DURATION) * 100;
    const isUrgent = timeLeft <= 60;

    // Parse pickup display: "Lumbini(07:00 AM)(0)" → { name: "Lumbini", time: "07:00 AM", fare: 0 }
    const parsePoint = (point) => {
        const match = point.match(/^(.+?)\((.+?)\)\((.+?)\)$/);
        if (match) {
            return { raw: point, name: match[1], time: match[2], fare: Number(match[3]) };
        }
        // Drop format: "Tourist Buspark(0)"
        const dropMatch = point.match(/^(.+?)\((.+?)\)$/);
        if (dropMatch) {
            return { raw: point, name: dropMatch[1], fare: Number(dropMatch[2]) };
        }
        return { raw: point, name: point, fare: 0 };
    };

    const parsedPickups = pickupPoints.map(parsePoint);
    const parsedDrops = dropPoints.map(parsePoint);

    const selectedPickupParsed = parsePoint(selectedPickup);
    const selectedDropParsed = parsePoint(selectedDrop);
    const fareAdjustment = (selectedPickupParsed.fare || 0) + (selectedDropParsed.fare || 0);
    const baseTotal = selectedSeats ? selectedSeats.length * (price - cashback + fareAdjustment) : 0;
    const totalAmount = Math.max(0, baseTotal - discountAmount);
    const adjustedPrice = selectedSeats?.length > 0 ? totalAmount / selectedSeats.length : (price - cashback + fareAdjustment);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setApplyingCoupon(true);
        setCouponError(null);
        setCouponSuccess(null);
        try {
            const res = await api.get(`/coupons/validate`, {
                params: { code: couponCode, bookingAmount: baseTotal }
            });
            setAppliedCoupon(res.data);
            setDiscountAmount(res.data.discountAmount);
            setCouponSuccess(`Coupon "${couponCode}" applied! You saved रू ${res.data.discountAmount}`);
        } catch (err) {
            console.error('Coupon error:', err);
            setCouponError(err.response?.data?.message || 'Invalid or expired coupon code.');
            setAppliedCoupon(null);
            setDiscountAmount(0);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        setCouponSuccess(null);
        setCouponError(null);
    };

    const handleSubmit = async () => {
        if (!passengerName.trim()) {
            setError('Please enter passenger name.');
            return;
        }
        if (!contact.trim() || contact.length < 10) {
            setError('Please enter a valid contact number.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Step 1: Fill passenger details (skip if already filled — e.g. user went back from payment gateway)
            if (!passengerFilled) {
                const detailResult = await api.busPortal.fillPassenger({
                    name: passengerName,
                    contact,
                    pickup: selectedPickup,
                    drop: selectedDrop,
                    TicketNo: ticketNo,
                });

                if (detailResult.code !== '1' && detailResult.code !== 1) {
                    // If the portal says details are already filled, treat as success
                    const msg = (detailResult.message || detailResult.data || '').toLowerCase();
                    if (msg.includes('already') || msg.includes('filled') || msg.includes('exist')) {
                        setPassengerFilled(true);
                    } else {
                        setError(detailResult.message || detailResult.data || 'Failed to save passenger details.');
                        setSubmitting(false);
                        return;
                    }
                } else {
                    setPassengerFilled(true);
                }
            }

            // Step 2: Initiate payment through our payment gateway
            const paymentPayload = {
                ticketNo,
                method: paymentMethod,
                amount: baseTotal,
                passengerName,
                passengerPhone: contact,
                passengerEmail: passengerEmail || undefined,
                route: `${source} → ${destination}`,
                travelDate: date,
                seatNumbers: selectedSeats,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                frontendUrl: window.location.origin,
            };
            const paymentResult = await api.payments.initiate(paymentPayload);

            if (paymentMethod === 'esewa') {
                // eSewa — submit form redirect
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = paymentResult.redirectUrl;
                for (const [key, value] of Object.entries(paymentResult.formData)) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                }
                document.body.appendChild(form);
                form.submit();
                return; // Don't setSubmitting(false) — page is navigating away
            } else if (paymentMethod.startsWith('khalti')) {
                // Khalti variations — redirect to payment URL
                window.location.href = paymentResult.redirectUrl;
                return; // Don't setSubmitting(false) — page is navigating away
            } else if (paymentMethod === 'visa') {
                // Visa / Mastercard — redirect to HBL/PACO payment page
                window.location.href = paymentResult.redirectUrl;
                return; // Don't setSubmitting(false) — page is navigating away
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelHold = async () => {
        if (!ticketNo) return;
        try {
            await api.busPortal.cancelHold(ticketNo);
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Failed to cancel hold:', err);
            navigate('/', { replace: true });
        }
    };

    if (!ticketNo) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-[72px] pb-24 font-sans">
            <SEOHead
                title="Passenger Details"
                description="Enter passenger details to complete your bus booking with New Road Travels."
                noIndex={true}
            />
            {/* Header */}
            <div className="sticky top-[72px] z-10 bg-white shadow-md">
                <div className="p-4 flex items-center">
                    <button onClick={handleCancelHold} className="mr-4 text-gray-700 hover:text-red-500 transition-colors">
                        <FaArrowLeft size={18} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 flex-1">Passenger Details</h1>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${
                        isUrgent
                            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                        <FaClock className="text-[10px]" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
                {/* Timer Progress Bar */}
                <div className="h-1.5 bg-gray-100 relative w-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${
                            isUrgent ? 'bg-red-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${timerPercent}%` }}
                    />
                </div>
                {/* Urgency Banner */}
                {isUrgent && (
                    <div className="bg-red-500 text-white text-center py-2 px-4 text-xs font-bold animate-pulse">
                        ⚠️ Hurry! Complete your booking in {formatTime(timeLeft)} or seats will be released
                    </div>
                )}
            </div>

            <div className="max-w-xl mx-auto p-4 space-y-4">

                {/* Trip Info Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-sm font-bold text-gray-800">
                                {selectedSeats?.length} Seat(s) • {date}
                            </div>
                            <div className="text-base font-bold text-gray-900 mt-1 flex items-center gap-2">
                                <span>{source}</span>
                                <span className="text-gray-400">→</span>
                                <span>{destination}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {tripData?.CompanyName} • {tripData?.type}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded font-medium">
                            <FaBus className="inline mr-1" /> {tripData?.time}
                        </span>
                        <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded font-medium">
                            Seats: {selectedSeats?.join(', ')}
                        </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        Ticket No: <span className="font-mono font-bold">{ticketNo}</span>
                    </div>
                </div>

                {/* Passenger Form */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-1">Passenger Details</h2>
                    <p className="text-xs text-gray-500 mb-4">Fill in passenger information for this booking</p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={passengerName}
                                onChange={(e) => setPassengerName(e.target.value)}
                                className="w-full text-sm border-b border-gray-300 focus:border-red-500 outline-none pb-1 font-medium"
                                placeholder="Enter passenger name"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Contact Number *</label>
                            <input
                                type="tel"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className="w-full text-sm border-b border-gray-300 focus:border-red-500 outline-none pb-1 font-medium"
                                placeholder="98XXXXXXXX"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Email Address (Optional)</label>
                            <input
                                type="email"
                                value={passengerEmail}
                                onChange={(e) => setPassengerEmail(e.target.value)}
                                className="w-full text-sm border-b border-gray-300 focus:border-red-500 outline-none pb-1 font-medium"
                                placeholder="For ticket confirmation"
                            />
                        </div>
                    </div>
                </div>

                {/* Pickup Point Selection */}
                {parsedPickups.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-800 mb-3">Pickup Point</h2>
                        <div className="space-y-2">
                            {parsedPickups.map((p, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedPickup === p.raw
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="pickup"
                                            checked={selectedPickup === p.raw}
                                            onChange={() => setSelectedPickup(p.raw)}
                                            className="accent-red-500"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                            {p.time && <span className="text-xs text-gray-500 ml-2">{p.time}</span>}
                                        </div>
                                    </div>
                                    {p.fare !== 0 && (
                                        <span className="text-xs text-green-600 font-bold">
                                            {p.fare < 0 ? `Save रू ${Math.abs(p.fare)}` : `+ रू ${p.fare}`}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Drop Point Selection */}
                {parsedDrops.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-800 mb-3">Drop Point</h2>
                        <div className="space-y-2">
                            {parsedDrops.map((p, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedDrop === p.raw
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="drop"
                                            checked={selectedDrop === p.raw}
                                            onChange={() => setSelectedDrop(p.raw)}
                                            className="accent-red-500"
                                        />
                                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                    </div>
                                    {p.fare !== 0 && (
                                        <span className="text-xs text-green-600 font-bold">
                                            {p.fare < 0 ? `Save रू ${Math.abs(p.fare)}` : `+ रू ${p.fare}`}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Coupon Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-2">Apply Coupon</h2>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                disabled={appliedCoupon}
                                className={`w-full text-sm border rounded-lg px-3 py-2.5 outline-none transition-all ${appliedCoupon ? 'bg-gray-50 border-green-200 text-green-700 font-bold' : 'border-gray-200 focus:border-red-500'}`}
                                placeholder="Enter coupon code (e.g. SAVE10)"
                            />
                            {appliedCoupon && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                        </div>
                        {appliedCoupon ? (
                            <button
                                onClick={removeCoupon}
                                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-bold hover:bg-gray-50"
                            >
                                Remove
                            </button>
                        ) : (
                            <button
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon || !couponCode.trim()}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-black disabled:bg-gray-300 transition-colors"
                            >
                                {applyingCoupon ? '...' : 'Apply'}
                            </button>
                        )}
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-2 ml-1">{couponError}</p>}
                    {couponSuccess && <p className="text-xs text-green-600 mt-2 ml-1 font-medium">{couponSuccess}</p>}
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-3">Choose Payment Method</h2>
                    <div className="space-y-2">
                        {/* eSewa */}
                        <label
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'esewa'
                                ? 'border-green-500 bg-green-50 shadow-sm'
                                : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'esewa'}
                                    onChange={() => { setPaymentMethod('esewa'); setError(null); }}
                                    className="accent-green-500 w-4 h-4"
                                />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                                    <img src="/assets/payment/esewa-logo.png" alt="eSewa" className="w-full h-full object-contain p-1" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800">eSewa</span>
                                    <p className="text-xs text-gray-500">Pay with eSewa wallet</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">Instant</span>
                        </label>

                        {/* Khalti Wallet */}
                        <label
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'khalti'
                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'khalti'}
                                    onChange={() => { setPaymentMethod('khalti'); setError(null); }}
                                    className="accent-purple-500 w-4 h-4"
                                />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                                    <img src="/assets/payment/khalti-logo.png" alt="Khalti" className="w-full h-full object-contain p-1" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800">Khalti Wallet</span>
                                    <p className="text-xs text-gray-500">Pay with Khalti balance</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">Popular</span>
                        </label>

                        {/* Connect IPS */}
                        <label
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'khalti_connectips'
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'khalti_connectips'}
                                    onChange={() => { setPaymentMethod('khalti_connectips'); setError(null); }}
                                    className="accent-indigo-500 w-4 h-4"
                                />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                                    <img src="/assets/payment/khalti-logo.png" alt="Khalti" className="w-full h-full object-contain p-1" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800">Connect IPS</span>
                                    <p className="text-xs text-gray-500">Bank Transfer (via Khalti)</p>
                                </div>
                            </div>
                        </label>

                        {/* Mobile Banking */}
                        <label
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'khalti_mobilebanking'
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'khalti_mobilebanking'}
                                    onChange={() => { setPaymentMethod('khalti_mobilebanking'); setError(null); }}
                                    className="accent-blue-500 w-4 h-4"
                                />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                                    <img src="/assets/payment/khalti-logo.png" alt="Khalti" className="w-full h-full object-contain p-1" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800">Mobile Banking</span>
                                    <p className="text-xs text-gray-500">M-Banking apps (via Khalti)</p>
                                </div>
                            </div>
                        </label>

                        {/* e-Banking */}
                        <label
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'khalti_ebanking'
                                ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                                : 'border-gray-200 hover:border-cyan-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'khalti_ebanking'}
                                    onChange={() => { setPaymentMethod('khalti_ebanking'); setError(null); }}
                                    className="accent-cyan-500 w-4 h-4"
                                />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                                    <img src="/assets/payment/khalti-logo.png" alt="Khalti" className="w-full h-full object-contain p-1" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800">e-Banking</span>
                                    <p className="text-xs text-gray-500">Internet Banking (via Khalti)</p>
                                </div>
                            </div>
                        </label>

                        {/* Visa/Mastercard */}
                        <label
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'visa'
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'visa'}
                                    onChange={() => { setPaymentMethod('visa'); setError(null); }}
                                    className="accent-blue-500 w-4 h-4"
                                />
                                <div className="w-10 h-10 text-2xl text-blue-800 rounded-xl flex items-center justify-center overflow-hidden bg-blue-50 border border-blue-100">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M470.1 231.3s7.6 37.3 19.3 62.4c-34.4 50.4-108.7 81.3-176.1 90.9-46.7 6.6-96.2-4.1-137.9-25.1-66.2-33.3-112.9-97.1-118.8-171.1C50 106.6 114.6 42.1 190.5 42.1c37.5 0 72.8 14.8 99.4 41.5 25.7 25.7 41.1 61.3 41.1 99.4 0 5.1-.2 10.1-.6 15h139.7zM331.4 183h-192c-5.7 0-10.4 4.7-10.4 10.4v31.3c0 5.7 4.7 10.4 10.4 10.4h192c5.7 0 10.4-4.7 10.4-10.4v-31.3c0-5.7-4.7-10.4-10.4-10.4z"></path></svg>
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-800">Visa / Mastercard</span>
                                    <p className="text-xs text-gray-500">Credit or Debit cards</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">New</span>
                        </label>

                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="text-center py-4 text-xs text-gray-400">
                    By proceeding, I agree to the <span className="text-blue-500 border-b border-blue-500">T&Cs</span>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-6 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-gray-900">
                            रू {totalAmount}
                        </div>
                        {discountAmount > 0 && (
                            <span className="text-xs line-through text-gray-400">रू {baseTotal}</span>
                        )}
                    </div>
                    {discountAmount > 0 && (
                        <div className="text-xs text-green-600 font-bold">
                            Coupon Applied: - रू {discountAmount}
                        </div>
                    )}
                    {fareAdjustment !== 0 && (
                        <div className="text-xs text-gray-500">
                            रू {Math.abs(fareAdjustment)} {fareAdjustment < 0 ? 'saved' : 'added'} via pickup/drop
                        </div>
                    )}
                    <div className="text-xs text-gray-500">
                        {selectedSeats?.length} Seat(s)
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-[#EF4F5F] hover:bg-[#d94151] disabled:bg-gray-400 text-white font-bold py-2.5 px-8 rounded-lg text-sm shadow-md transition-transform active:scale-95"
                    >
                        {submitting ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default PassengerDetails;


