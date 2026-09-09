

import React from "react";
import BookingOptions from "../../components/BookingOptions";
import DynamicTable from "./Agentbookingtable"; 

export default function AdminBooking() {
  return (
    <div className="p-6 bg-gray-50 h-full w-full">
      <h1 className="text-2xl font-bold mb-4">Agent Booking</h1>
      
      <div className="mt-8 " >
<BookingOptions role="admin" />
</div>
      
<div className="mt-8 max-w-5xl"> 
<DynamicTable  />
</div>


    </div>
  );
}
