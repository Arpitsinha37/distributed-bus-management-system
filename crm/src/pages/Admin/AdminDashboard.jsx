

import React, { useState, useEffect } from "react";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { getData } from "/src/services/apiService";

export default function AdminDashboard() {

  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const res = await getData("/api/dashboard/stats");

      if (res?.success) {
        setStatsData(res.data);
      }
    } catch (error) {
      console.error("Dashboard stats error:", error);
    } finally {
      setStatsLoading(false);
    }
  };


  const stats = [
    {
      title: "Total Agents",
      value: statsData?.totalAgents ?? 0,
      icon: <Users className="text-white w-5 h-5" />,
      bg: "bg-blue-500",
    },
    {
      title: "Total Bookings",
      value: statsData?.totalBookings ?? 0,
      icon: <CreditCard className="text-white w-5 h-5" />,
      bg: "bg-green-500",
    },
    {
      title: "Revenue",
      value: `₹${(statsData?.totalRevenue ?? 0).toLocaleString()}`,
      icon: <DollarSign className="text-white w-5 h-5" />,
      bg: "bg-purple-500",
    },
    {
      title: "Active Bookings",
      value: statsData?.activeBookings ?? 0,
      icon: <TrendingUp className="text-white w-5 h-5" />,
      bg: "bg-orange-500",
    },
  ];


 


  return (
    <div className="min-h-screen bg-gray-50 p-6">
     
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Dashboard Overview
        </h2>
        <p className="text-sm text-gray-500">
          Monitor your travel booking system performance
        </p>
      </div>

     
      {statsLoading ? (
        <p className="mt-6 text-gray-500">Loading dashboard stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {item.title}
                </p>
                <div className={`${item.bg} p-2 rounded-lg`}>
                  {item.icon}
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

 

    </div>
  );
}

