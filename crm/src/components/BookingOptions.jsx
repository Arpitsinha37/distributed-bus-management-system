

import React from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Train, Bus } from "lucide-react";
import { getData } from "../services/apiService";
import { useEffect, useState } from "react";


const BookingOptions = () => {
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role") || "agent";
 const [userData, setUserData] = useState(null);
   const agentid = sessionStorage.getItem("agentId") ;
  console.log(agentid);
  
 useEffect(() => {        
    const fetchUserData = async () => {
      try {   
        const data = await getData("/api/dashboard/dashboard-stats"); 
        setUserData(data || null);  
        console.log(data);
        
      } catch (error) { 
        console.error("Error fetching user data:", error);  
      }   
    };  
    fetchUserData();
  }, []);

  const bookingOptions = [
    {
      id: "flight",
      icon: <Plane className="w-10 h-10 text-blue-500" />,
      title: "Flight Booking",
      desc: "Book domestic and international flights",
      route: `/${role}/booking/flight`,
      booking  : userData?.flightCount || 0
    },
    {
      id: "train",
      icon: <Train className="w-10 h-10 text-green-500" />,
      title: "Train Booking",
      desc: "Book train tickets with PNR tracking",
      route: `/${role}/booking/train`,
       booking  : userData?.railwayCount || 0
    },
    {
      id: "bus",
      icon: <Bus className="w-10 h-10 text-orange-500" />,
      title: "Bus Booking",
      desc: "Book bus tickets for intercity travel",
      route: `/${role}/booking/bus`,
       booking  : userData?.busCount || 0
    },
  ];

  const handleSelect = (route) => {
    navigate(route);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">New Booking</h2>
      <p className="text-gray-600 mb-6">
        Select booking type to get started
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {bookingOptions.map((opt) => (
          <div
            key={opt.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          > <div className="flex justify-between items-center mb-3">
  <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">
    {opt.booking}
  </span>
  
</div>
            <div className="flex justify-center mb-3">{opt.icon}</div>
            <h3 className="text-lg font-semibold text-center">{opt.title}</h3>
            <p className="text-gray-600 text-center text-sm mb-4">
              {opt.desc}
            </p>
            <button
              onClick={() => handleSelect(opt.route)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-white hover:text-blue-500 transition"
            >
              Select {opt.title.split(" ")[0]}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingOptions;
