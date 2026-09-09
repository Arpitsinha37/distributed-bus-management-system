

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import AgentSidebar from "../components/Sidebar/AgentSidebar";

export default function AgentLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {isSidebarOpen && <AgentSidebar onClose={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

