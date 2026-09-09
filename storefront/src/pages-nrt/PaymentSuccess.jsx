import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SEOHead from '../components/nrt/SEOHead';

// ─── Confetti Particle Component ───
const ConfettiParticle = ({ delay, left, color, size }) => {
    return (
        <div
            className="absolute rounded-sm opacity-0"
            style={{
                left: `${left}%`,
                top: '-10px',
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                animation: `confettiFall 2.5s ease-in ${delay}s forwards`,
            }}
        />
    );
};

const CONFETTI_COLORS = [
    '#10B981', '#34D399', '#6EE7B7', '#059669',
    '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(3);
    const [showContent, setShowContent] = useState(false);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const redirectTimerRef = useRef(null);
    const countdownRef = useRef(null);

    const status = searchParams.get('status');
    const method = searchParams.get('method');
    const ticketNo = searchParams.get('ticketNo');
    const txnId = searchParams.get('txnId');
    const paymentId = searchParams.get('paymentId');

    const isSuccess = status === 'success';

    const methodLabel = method === 'esewa' ? 'eSewa' : method === 'khalti' ? 'Khalti' : method === 'khalti_mobilebanking' ? 'Mobile Banking' : method === 'cash_on_bus' ? 'Cash on Bus' : method;

    // Stagger the entrance animations
    useEffect(() => {
        if (!isSuccess) return;
        const t1 = setTimeout(() => setShowContent(true), 100);
        const t2 = setTimeout(() => setShowCheckmark(true), 400);
        const t3 = setTimeout(() => setShowDetails(true), 800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isSuccess]);

    // Countdown + auto redirect after 3 seconds
    useEffect(() => {
        if (!isSuccess || !ticketNo) return;

        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        redirectTimerRef.current = setTimeout(() => {
            navigate(`/ticket?ticketNo=${ticketNo}`, { replace: true });
        }, 3000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        };
    }, [isSuccess, ticketNo, navigate]);

    // ─── Success State ───
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
                <SEOHead title="Payment Successful!" description="Your payment has been processed successfully" noIndex={true} />

                {/* Confetti Overlay */}
                <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <ConfettiParticle
                            key={i}
                            delay={Math.random() * 1.5}
                            left={Math.random() * 100}
                            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                            size={6 + Math.random() * 8}
                        />
                    ))}
                </div>

                {/* Ambient glow circles */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Main Card */}
                <div
                    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 max-w-md w-full overflow-hidden relative z-20 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                >
                    {/* Success Header */}
                    <div className="relative px-8 pt-10 pb-6 text-center">
                        {/* Animated Checkmark Circle */}
                        <div className={`mx-auto mb-5 relative transition-all duration-700 ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                            {/* Outer ring pulse */}
                            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                            {/* Inner circle */}
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200/50 relative">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                        className="checkmark-path"
                                    />
                                </svg>
                                {/* Sparkle dots */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                                <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }} />
                                <div className="absolute top-0 -left-3 w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1.1s' }} />
                            </div>
                        </div>

                        <h1 className={`text-3xl font-extrabold text-gray-900 mb-2 transition-all duration-500 delay-100 ${showCheckmark ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Payment Successful!
                        </h1>
                        <p className={`text-gray-500 text-sm transition-all duration-500 delay-200 ${showCheckmark ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Your booking has been confirmed
                        </p>
                    </div>

                    {/* Ticket Details */}
                    <div className={`px-8 pb-4 transition-all duration-600 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <div className="bg-gradient-to-br from-gray-50 to-emerald-50/50 rounded-2xl p-5 border border-gray-100/80 space-y-3">
                            {ticketNo && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ticket No</span>
                                    <span className="font-mono font-bold text-gray-900 text-sm bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">{ticketNo}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Payment</span>
                                <span className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-300" />
                                    {methodLabel}
                                </span>
                            </div>
                            {txnId && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Transaction</span>
                                    <span className="font-mono text-gray-500 text-xs">{txnId.slice(0, 20)}{txnId.length > 20 ? '...' : ''}</span>
                                </div>
                            )}
                        </div>

                        {/* Email notice */}
                        <div className="mt-4 bg-blue-50/80 rounded-xl p-3.5 flex items-start gap-2.5 border border-blue-100/50">
                            <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <p className="text-xs text-blue-700 leading-relaxed">A confirmation email has been sent to your registered email address.</p>
                        </div>
                    </div>

                    {/* Redirect countdown + progress bar */}
                    <div className={`px-8 pb-8 pt-2 transition-all duration-600 delay-300 ${showDetails ? 'opacity-100' : 'opacity-0'}`}>
                        {/* Auto-redirect progress bar */}
                        <div className="mb-4">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                                    style={{
                                        animation: 'progressShrink 3s linear forwards',
                                        width: '100%',
                                    }}
                                />
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2.5 font-medium">
                                Redirecting to your ticket in <span className="text-emerald-600 font-bold tabular-nums">{countdown}</span> second{countdown !== 1 ? 's' : ''}…
                            </p>
                        </div>

                        {/* Manual button */}
                        <button
                            onClick={() => {
                                if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
                                if (countdownRef.current) clearInterval(countdownRef.current);
                                navigate(`/ticket?ticketNo=${ticketNo}`, { replace: true });
                            }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200/50 active:scale-[0.97] flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            View & Download Ticket
                        </button>

                        <button
                            onClick={() => {
                                if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
                                if (countdownRef.current) clearInterval(countdownRef.current);
                                navigate('/', { replace: true });
                            }}
                            className="w-full mt-3 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
                        >
                            Go to Homepage
                        </button>
                    </div>
                </div>

                {/* CSS Keyframes */}
                <style>{`
                    @keyframes confettiFall {
                        0% {
                            opacity: 1;
                            transform: translateY(0) rotate(0deg) scale(1);
                        }
                        50% {
                            opacity: 1;
                        }
                        100% {
                            opacity: 0;
                            transform: translateY(100vh) rotate(720deg) scale(0.3);
                        }
                    }

                    @keyframes progressShrink {
                        0% { width: 100%; }
                        100% { width: 0%; }
                    }

                    .checkmark-path {
                        stroke-dasharray: 30;
                        stroke-dashoffset: 30;
                        animation: drawCheck 0.6s ease-out 0.6s forwards;
                    }

                    @keyframes drawCheck {
                        to {
                            stroke-dashoffset: 0;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // ─── Failed State ───
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8">
            <SEOHead title="Payment Failed" description="Payment could not be processed" noIndex={true} />
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full overflow-hidden">
                {/* Error Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-8 text-center text-white relative">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Payment Failed</h1>
                    <p className="text-red-100 text-sm">Your payment could not be completed</p>
                </div>

                {/* Error Details */}
                <div className="px-8 py-6">
                    <div className="bg-red-50 rounded-xl p-4 mb-5">
                        <p className="text-sm text-red-700">
                            Your payment could not be processed. This could be due to insufficient balance, network issues, or a cancelled transaction. If your money was deducted, please contact us at <strong>9856068470</strong> — we will resolve it immediately.
                        </p>
                    </div>

                    {ticketNo && (
                        <div className="flex justify-between items-center text-sm mb-5 bg-gray-50 p-3 rounded-xl">
                            <span className="text-gray-400">Ticket</span>
                            <span className="font-mono font-bold text-gray-700">{ticketNo}</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-red-200 active:scale-[0.98]"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/', { replace: true })}
                            className="w-full border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Back to Homepage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;


