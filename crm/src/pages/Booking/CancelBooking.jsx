
import React, { useState } from "react";
import CancellationForm from "./CancellationForm";

export default function CancelBooking() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const bookings = [
    {
      id: "BK101",
      clientName: "Amit Sharma",
      bookingDate: "2024-10-28",
      mode: "Flight",
      route: "Delhi - Mumbai",
      status: "confirmed",
      payment: 8500,
      ticketAmount: 8000,
      bookingCharge: 500,
    },
    {
      id: "BK102",
      clientName: "Neha Patel",
      bookingDate: "2024-10-25",
      mode: "Train",
      route: "Mumbai - Bangalore",
      status: "confirmed",
      payment: 2100,
      ticketAmount: 2000,
      bookingCharge: 100,
    },
    {
      id: "BK103",
      clientName: "Rohan Gupta",
      bookingDate: "2024-10-30",
      mode: "Bus",
      route: "Pune - Goa",
      status: "confirmed",
      payment: 1200,
      ticketAmount: 1000,
      bookingCharge: 200,
    },
  ];

  const filtered = bookings.filter((b) =>
    b.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-1 text-gray-800">
        Cancellation Management
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Process booking cancellations and refunds
      </p>

    
      <div className="bg-white shadow rounded-xl p-4 mb-8">
        <input
          type="text"
          placeholder="Search confirmed bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

      
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="text-left py-2">Booking ID</th>
              <th className="text-left">Client Name</th>
              <th className="text-left">Booking Date</th>
              <th className="text-left">Mode</th>
              <th className="text-left">Route</th>
              <th className="text-left">Status</th>
              <th className="text-left">Payment</th>
              <th className="text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{b.id}</td>
                <td>{b.clientName}</td>
                <td>{b.bookingDate}</td>
                <td>{b.mode}</td>
                <td>{b.route}</td>
                <td>
                  <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                    Confirmed
                  </span>
                </td>
                <td>₹{b.payment}</td>
                <td>
                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
      {selectedBooking && (
        <CancellationForm
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
