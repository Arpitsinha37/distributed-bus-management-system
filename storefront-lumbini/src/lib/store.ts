import { create } from 'zustand';
import { Passenger } from './types';

interface BookingState {
  tripId: string | null;
  selectedSeats: string[];
  passengers: Passenger[];
  customerInfo: { name: string; phone: string; email: string };
  bookingId: string | null;
  bookingRef: string | null;
  heldUntil: string | null;
  boardingPoint: string | null;
  droppingPoint: string | null;

  setTrip: (tripId: string) => void;
  toggleSeat: (seatNumber: string) => void;
  setPassenger: (index: number, passenger: Passenger) => void;
  setCustomerInfo: (info: { name: string; phone: string; email: string }) => void;
  setBookingDetails: (bookingId: string, bookingRef: string, heldUntil: string) => void;
  setPoints: (boarding: string, dropping: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  tripId: null,
  selectedSeats: [],
  passengers: [],
  customerInfo: { name: '', phone: '', email: '' },
  bookingId: null,
  bookingRef: null,
  heldUntil: null,
  boardingPoint: null,
  droppingPoint: null,

  setTrip: (tripId) => set({ tripId, selectedSeats: [], passengers: [] }),
  toggleSeat: (seatNumber) =>
    set((state) => {
      const isSelected = state.selectedSeats.includes(seatNumber);
      const newSeats = isSelected
        ? state.selectedSeats.filter((s) => s !== seatNumber)
        : [...state.selectedSeats, seatNumber];
      
      const newPassengers = newSeats.map((seat) => {
        const existing = state.passengers.find((p) => p.seatNumber === seat);
        return existing || { name: '', seatNumber: seat };
      });

      return { selectedSeats: newSeats, passengers: newPassengers };
    }),
  setPassenger: (index, passenger) =>
    set((state) => {
      const newPassengers = [...state.passengers];
      newPassengers[index] = passenger;
      return { passengers: newPassengers };
    }),
  setCustomerInfo: (info) => set({ customerInfo: info }),
  setBookingDetails: (bookingId, bookingRef, heldUntil) => set({ bookingId, bookingRef, heldUntil }),
  setPoints: (boarding, dropping) => set({ boardingPoint: boarding, droppingPoint: dropping }),
  reset: () =>
    set({
      tripId: null,
      selectedSeats: [],
      passengers: [],
      customerInfo: { name: '', phone: '', email: '' },
      bookingRef: null,
      heldUntil: null,
      boardingPoint: null,
      droppingPoint: null,
    }),
}));
