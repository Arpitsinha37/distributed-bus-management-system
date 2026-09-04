export interface TripSearchResult {
  tripId: string;
  scheduleId: string;
  departureTime: string;
  fare: string;
  bus: { type: string; amenities: string[] };
  route: { origin: string; destination: string };
  availableSeats: number;
}

export interface TripDetail {
  tripId: string;
  departureTime: string;
  fare: string;
  route: { origin: string; destination: string; boardingPoints: string[]; droppingPoints: string[] };
  bus: { type: string; amenities: string[] };
  layout: { seats: { number: string; type: string }[] };
  seats: { seatNumber: string; status: 'AVAILABLE' | 'HELD' | 'BOOKED' }[];
}

export interface Passenger {
  name: string;
  age?: number;
  gender?: string;
  seatNumber: string;
}

export interface HoldSeatsResponse {
  id: string;
  bookingRef: string;
  status: string;
  totalFare: string;
  heldUntil: string;
}
