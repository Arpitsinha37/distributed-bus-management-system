  


import React, { useState, useEffect } from "react";
import { DollarSign, Users, ClipboardList, XCircle, LogIn } from "lucide-react";
import { getData } from "/src/services/apiService";

export default function AgentDashboard() {
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

 
  const agentId = sessionStorage.getItem("agentID");
  console.log(agentId);
  

  useEffect(() => {
    setTimeout(() => setShowInquiryModal(true), 800);
    fetchAgentStats();
  }, []);

  const fetchAgentStats = async () => {
    try {
      setLoading(true);
      const res = await getData(`/api/dashboard/agentStats/${agentId}`);

      if (res?.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Agent dashboard stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "Today's Bookings",
      value: stats?.todayBookings ?? 0,
      sub: `${stats?.todayBookings ?? 0} today Bookings `,
      icon: <ClipboardList className="text-blue-600" />,
    },
    {
      title: "Total Booking",
      value: stats?.totalBookings ?? 0,
      sub: `+${stats?.totalBookings ?? 0} Total Booking`,
      icon: <Users className="text-green-600" />,
    },
    {
      title: "This Month Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() ?? 0}`,
      sub: `+${stats?.totalRevenue ?? 0}% from last month`,
      icon: <DollarSign className="text-purple-600" />,
    },
    {
      title: "Cancellations",
      value: stats?.cancelledBookings ?? 0,
      sub: `${stats?.cancelledBookings ?? 0} Cancellations`,
      icon: <XCircle className="text-red-600" />,
    },
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">
        Welcome back, Agent User
      </h2>
      <p className="text-gray-500 mb-6">
        Your daily bookings and client activities
      </p>

      {loading ? (
        <p className="text-gray-500">Loading dashboard data...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.map((card, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-600">{card.title}</h3>
                <span className="bg-gray-100 p-2 rounded-full">
                  {card.icon}
                </span>
              </div>
              <p className="text-2xl font-semibold mt-2">{card.value}</p>
              <p className="text-sm text-gray-500">{card.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
