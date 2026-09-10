'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Home, Ticket, RefreshCw } from 'lucide-react';

// Confetti Particle
const ConfettiParticle = ({ delay, left, color, size }: { delay: number; left: number; color: string; size: number }) => (
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

const CONFETTI_COLORS = [
  '#10B981', '#34D399', '#6EE7B7', '#059669',
  '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [showContent, setShowContent] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const status = searchParams.get('status');
  const method = searchParams.get('method');
  const ticketNo = searchParams.get('ticketNo');
  const txnId = searchParams.get('txnId');
  const pnr = searchParams.get('pnr');

  const isSuccess = status === 'success';

  const methodLabel: Record<string, string> = {
    esewa: 'eSewa',
    khalti: 'Khalti',
    khalti_mobilebanking: 'Mobile Banking',
    cash_on_bus: 'Cash on Bus',
    paco: 'Visa / Mastercard',
    visa: 'Visa / Mastercard',
  };

  // Stagger entrance animations
  useEffect(() => {
    if (!isSuccess) return;
    const t1 = setTimeout(() => setShowContent(true), 100);
    const t2 = setTimeout(() => setShowCheckmark(true), 400);
    const t3 = setTimeout(() => setShowDetails(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isSuccess]);

  // Countdown + auto redirect
  useEffect(() => {
    const targetPnr = pnr || ticketNo;
    if (!isSuccess || !targetPnr) return;

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    redirectTimerRef.current = setTimeout(() => {
      router.push(`/ticket/${targetPnr}`);
    }, 5000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [isSuccess, pnr, ticketNo, router]);

  // ── Success State ──
  if (isSuccess) {
    const targetPnr = pnr || ticketNo;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">

        {/* Confetti */}
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

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />

        <div className={`relative z-20 w-full max-w-md mx-auto transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/30 rounded-full -translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/20 rounded-full translate-x-12 translate-y-12" />
              </div>

              <div className={`relative z-10 transition-all duration-500 ${showCheckmark ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white relative z-10">Payment Successful!</h1>
              <p className="text-emerald-100 mt-2 text-sm relative z-10">Your booking has been confirmed</p>
            </div>

            {/* Details */}
            <div className={`p-8 transition-all duration-500 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="space-y-4 mb-8">
                {method && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="font-bold text-gray-900">{methodLabel[method] || method}</span>
                  </div>
                )}
                {txnId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono font-bold text-gray-900 text-xs">{txnId}</span>
                  </div>
                )}
                {targetPnr && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">PNR / Ticket</span>
                    <span className="font-mono font-bold text-emerald-600">{targetPnr}</span>
                  </div>
                )}
              </div>

              {/* Auto-redirect notice */}
              {targetPnr && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-center">
                  <p className="text-sm text-emerald-700">
                    Redirecting to your ticket in <span className="font-bold text-emerald-900">{countdown}s</span>...
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {targetPnr && (
                  <button
                    onClick={() => router.push(`/ticket/${targetPnr}`)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
                  >
                    <Ticket className="w-4 h-4" />
                    View Ticket
                  </button>
                )}
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confetti Animation Keyframes */}
        <style jsx>{`
          @keyframes confettiFall {
            0% { opacity: 1; transform: translateY(0) rotate(0deg); }
            100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── Failure State ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
            <p className="text-red-100 mt-2 text-sm">Your payment could not be processed</p>
          </div>
          <div className="p-8">
            <p className="text-gray-600 text-sm text-center mb-6">
              Don&apos;t worry — no money has been deducted. Please try again or choose a different payment method.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
