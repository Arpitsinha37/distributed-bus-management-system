

import React, { useState, useEffect } from "react";
import { getData } from "../../services/apiService";

const CancelledBookingTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getData("/api/cancelBooking/cancelled");
      setData(response.cancelledBookings || []);
    } catch (error) {
      console.error("Error fetching cancelled bookings:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
        Cancelled Bookings
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Route</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ticket Status</th>
           
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cancellation Date</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{row.clientName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row.type}</td>
                
                  <td className="px-6 py-4 text-sm text-gray-900">{row.ticketStatus}</td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900">{row.cancellationDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No cancelled bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CancelledBookingTable;
