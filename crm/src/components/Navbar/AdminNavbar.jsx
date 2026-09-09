import React from "react";
import { Menu, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-white via-purple-100 to-purple-300 shadow-md px-6 py-3 border-b border-purple-300 transition-all duration-300">
      {/* Left Side */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md bg-white/60 hover:bg-purple-100 transition-all duration-200 shadow-sm"
        >
          <Menu size={20} className="text-purple-700" />
        </button>

        <h1 className="text-lg font-semibold text-purple-800">
          {isAdmin ? "Admin Dashboard" : "Agent Dashboard"}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="flex items-center border border-purple-300 text-sm font-medium text-purple-700 rounded-lg px-3 py-1.5 bg-white/70 hover:bg-purple-200 hover:text-purple-900 hover:shadow-md transition-all duration-200"
        >
          <LogOut size={18} className="mr-1" /> Logout
        </button>
      </div>
    </nav>
  );
}
