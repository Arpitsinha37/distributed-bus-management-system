

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/Navbar/AdminNavbar";
import AdminSidebar from "../components/Sidebar/AdminSidebar";

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100">
    
      {isSidebarOpen && (
        <div className="fixed md:static z-50 w-64">
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
       
        <AdminNavbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />

  
        <main className="flex-1 overflow-y-auto p-6 bg-white/70 backdrop-blur-sm rounded-tl-2xl shadow-inner transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
