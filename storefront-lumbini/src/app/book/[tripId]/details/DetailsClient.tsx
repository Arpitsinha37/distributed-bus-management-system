'use client';

import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { TripDetail } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { ArrowLeft, Clock, Bus } from 'lucide-react';

export default function DetailsClient({ trip }: { trip: TripDetail }) {
  const router = useRouter();
  const { 
    selectedSeats, 
    setBookingDetails
  } = useBookingStore();
  
  const [passengerName, setPassengerName] = useState('');
  const [contact, setContact] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [selectedPickup, setSelectedPickup] = useState(trip.route.boardingPoints[0] || '');
  const [selectedDrop, setSelectedDrop] = useState(trip.route.droppingPoints[0] || '');
  
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountAmount: number} | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 4-minute Hold Timer
  const HOLD_DURATION = 4 * 60;
  const [timeLeft, setTimeLeft] = useState(HOLD_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedSeats.length === 0) {
      router.push(`/`);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          router.push(`/`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [selectedSeats, router]);

  if (selectedSeats.length === 0) return null;

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerPercent = (timeLeft / HOLD_DURATION) * 100;
  const isUrgent = timeLeft <= 60;

  const price = Number(trip.fare);
  const baseTotal = selectedSeats.length * price;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, baseTotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode === 'SAVE10') {
      setAppliedCoupon({ code: 'SAVE10', discountAmount: baseTotal * 0.1 });
    } else {
      setError('Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
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
      setError('');

      try {
          // 1. Hold seats
          const holdRes = await api.post('/bookings/hold', {
              tripId: trip.tripId,
              seats: selectedSeats,
              boardingPoint: selectedPickup,
              droppingPoint: selectedDrop,
              customerInfo: { name: passengerName, email: passengerEmail, phone: contact },
              passengers: selectedSeats.map(seat => ({ seatNumber: seat, name: passengerName, age: 30 }))
          });
          
          const bookingId = holdRes.data.id;
          
          // 2. Initiate Payment
          const gateway = paymentMethod === 'visa' ? 'paco' : paymentMethod;
          const payRes = await api.post(`/payments/${gateway}/initiate`, {
              bookingId
          });

          if (gateway === 'esewa') {
              const formData = JSON.parse(atob(payRes.data.clientSecret));
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = payRes.data.redirectUrl;
              for (const [key, value] of Object.entries(formData)) {
                  const input = document.createElement('input');
                  input.type = 'hidden';
                  input.name = key;
                  input.value = value as string;
                  form.appendChild(input);
              }
              document.body.appendChild(form);
              form.submit();
              return;
          } else if (gateway === 'khalti' || gateway === 'paco') {
              window.location.href = payRes.data.redirectUrl;
              return;
          } else {
            // Mock Fallback
            const mock = await api.post(`/bookings/${bookingId}/mock-pay`, {
              gateway,
              gatewayTxnId: `TXN-${Math.floor(Math.random() * 1000000)}`,
              expectedFare: totalAmount
            });
            if (mock.data.status === 'CONFIRMED') {
              router.push(`/ticket/${mock.data.bookingRef}`);
            }
          }

      } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.message || 'Something went wrong. Please try again.');
          setSubmitting(false);
      }
  };

  return (
      <div className="w-full">
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
              <div className="p-4 flex items-center max-w-xl mx-auto">
                  <button onClick={() => router.back()} className="mr-4 text-gray-700 hover:text-teal-600 transition-colors">
                      <ArrowLeft size={18} />
                  </button>
                  <h1 className="text-lg font-bold text-gray-800 flex-1">Passenger Details</h1>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${
                      isUrgent
                          ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(timeLeft)}</span>
                  </div>
              </div>
              <div className="h-1.5 bg-gray-100 relative w-full overflow-hidden">
                  <div
                      className={`h-full transition-all duration-1000 ease-linear ${
                          isUrgent ? 'bg-red-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${timerPercent}%` }}
                  />
              </div>
          </div>

          <div className="max-w-xl mx-auto p-4 space-y-4 pt-4">

              {/* Trip Info Card */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <div className="text-sm font-bold text-gray-800">
                              {selectedSeats.length} Seat(s)
                          </div>
                          <div className="text-base font-bold text-gray-900 mt-1 flex items-center gap-2">
                              <span>{trip.route.origin}</span>
                              <span className="text-gray-400">→</span>
                              <span>{trip.route.destination}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                              {trip.bus?.operator} • {trip.bus?.type}
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                      <span className="bg-teal-50 text-teal-600 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                          <Bus className="w-3 h-3" /> {trip.departureTime}
                      </span>
                      <span className="bg-teal-50 text-teal-600 text-xs px-2 py-1 rounded font-medium">
                          Seats: {selectedSeats.join(', ')}
                      </span>
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
                              className="w-full text-sm border-b border-gray-300 focus:border-teal-500 outline-none pb-1 font-medium bg-transparent"
                              placeholder="Enter passenger name"
                          />
                      </div>

                      <div>
                          <label className="text-xs text-gray-500 block mb-1">Contact Number *</label>
                          <input
                              type="tel"
                              value={contact}
                              onChange={(e) => setContact(e.target.value)}
                              className="w-full text-sm border-b border-gray-300 focus:border-teal-500 outline-none pb-1 font-medium bg-transparent"
                              placeholder="98XXXXXXXX"
                          />
                      </div>

                      <div>
                          <label className="text-xs text-gray-500 block mb-1">Email Address (Optional)</label>
                          <input
                              type="email"
                              value={passengerEmail}
                              onChange={(e) => setPassengerEmail(e.target.value)}
                              className="w-full text-sm border-b border-gray-300 focus:border-teal-500 outline-none pb-1 font-medium bg-transparent"
                              placeholder="For ticket confirmation"
                          />
                      </div>
                  </div>
              </div>

              {/* Pickup Point Selection */}
              {trip.route.boardingPoints.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h2 className="text-sm font-bold text-gray-800 mb-3">Pickup Point</h2>
                      <div className="space-y-2">
                          {trip.route.boardingPoints.map((p, idx) => (
                              <label
                                  key={idx}
                                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedPickup === p
                                      ? 'border-teal-400 bg-teal-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                      }`}
                              >
                                  <div className="flex items-center gap-3">
                                      <input
                                          type="radio"
                                          name="pickup"
                                          checked={selectedPickup === p}
                                          onChange={() => setSelectedPickup(p)}
                                          className="accent-teal-500"
                                      />
                                      <span className="text-sm font-medium text-gray-800">{p}</span>
                                  </div>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              {/* Drop Point Selection */}
              {trip.route.droppingPoints.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h2 className="text-sm font-bold text-gray-800 mb-3">Drop Point</h2>
                      <div className="space-y-2">
                          {trip.route.droppingPoints.map((p, idx) => (
                              <label
                                  key={idx}
                                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedDrop === p
                                      ? 'border-teal-400 bg-teal-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                      }`}
                              >
                                  <div className="flex items-center gap-3">
                                      <input
                                          type="radio"
                                          name="drop"
                                          checked={selectedDrop === p}
                                          onChange={() => setSelectedDrop(p)}
                                          className="accent-teal-500"
                                      />
                                      <span className="text-sm font-medium text-gray-800">{p}</span>
                                  </div>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

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
                                  onChange={() => { setPaymentMethod('esewa'); setError(''); }}
                                  className="accent-green-500 w-4 h-4"
                              />
                              <div>
                                  <span className="text-sm font-bold text-gray-800">eSewa</span>
                                  <p className="text-xs text-gray-500">Pay with eSewa wallet</p>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">Instant</span>
                      </label>

                      {/* Khalti */}
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
                                  onChange={() => { setPaymentMethod('khalti'); setError(''); }}
                                  className="accent-purple-500 w-4 h-4"
                              />
                              <div>
                                  <span className="text-sm font-bold text-gray-800">Khalti Wallet</span>
                                  <p className="text-xs text-gray-500">Pay with Khalti balance</p>
                              </div>
                          </div>
                          <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-lg">Popular</span>
                      </label>

                      {/* Visa/MC */}
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
                                  onChange={() => { setPaymentMethod('visa'); setError(''); }}
                                  className="accent-blue-500 w-4 h-4"
                              />
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

          </div>

          {/* Footer Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-6 flex justify-center items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
              <div className="max-w-xl w-full flex justify-between items-center">
                  <div>
                      <div className="flex items-center gap-2">
                          <div className="text-xl font-bold text-gray-900">
                              रू {totalAmount}
                          </div>
                          {discountAmount > 0 && (
                              <span className="text-xs line-through text-gray-400">रू {baseTotal}</span>
                          )}
                      </div>
                      <div className="text-xs text-gray-500">
                          {selectedSeats.length} Seat(s)
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-2.5 px-8 rounded-lg text-sm shadow-md transition-transform active:scale-95"
                      >
                          {submitting ? 'Processing...' : 'Confirm & Pay'}
                      </button>
                  </div>
              </div>
          </div>

      </div>
  );
}
