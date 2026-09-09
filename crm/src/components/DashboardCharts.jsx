import React, { useEffect, useState } from "react";
import { readCSV } from "../utils/readCSV";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const DashboardCharts = () => {
  const [bus, setBus] = useState([]);
  const [railway, setRailway] = useState([]);
  const [refund, setRefund] = useState([]);
  const [travel, setTravel] = useState([]);

  useEffect(() => {
    readCSV("/data/Bus Booking data.csv", setBus);
    readCSV("/data/Railway BOOKING DATA.csv", setRailway);
    readCSV("/data/Refund Dashboard.csv", setRefund);
    readCSV("/data/Travel Booking Data.csv", setTravel);
  }, []);

  // 🔹 Example: Bus Booking Amount Chart
  const busAmountChart = {
    labels: bus.map(b => b.bookingDate),
    datasets: [
      {
        label: "Bus Booking Amount",
        data: bus.map(b => Number(b.totalAmount || 0)),
        backgroundColor: "rgba(54,162,235,0.6)",
      },
    ],
  };

  // 🔹 Example: Travel Status Pie
  const travelStatusCount = travel.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    return acc;
  }, {});

  const travelStatusChart = {
    labels: Object.keys(travelStatusCount),
    datasets: [
      {
        data: Object.values(travelStatusCount),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold mb-2">Bus Booking Amount</h3>
        <Bar data={busAmountChart} />
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold mb-2">Travel Booking Status</h3>
        <Doughnut data={travelStatusChart} />
      </div>
    </div>
  );
};

export default DashboardCharts;
