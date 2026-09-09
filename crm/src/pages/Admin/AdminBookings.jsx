

import React from "react";
import BookingOptions from "../../components/BookingOptions";
 import AdminBookingtable from "./Adminbookingtable";
export default function AgentBooking() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Booking</h1>
      <BookingOptions role="agent" />

 
  <AdminBookingtable />
    </div>
  );
}
