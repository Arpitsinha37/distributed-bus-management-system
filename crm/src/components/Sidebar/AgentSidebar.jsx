


import React from "react";
import { BarChart3, Users, BookOpen, FileText, X, RefreshCw, Ban ,ChevronDown,
  BuildingIcon, ChevronRight,Printer} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminSidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

   const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const menuItems = [
    { name: "Dashboard", path: "/agent", icon: <BarChart3 size={18} /> },
    // { name: "Agent Management", path: "/admin/agents", icon: <Users size={18} /> },
    // { name: "Inquiry", path: "/agent/inquiry", icon: <FileText size={18} /> },
    // { name: "Bookings", path: "/agent/bookings", icon: <BookOpen size={18} /> },
     {
        name: "Bookings",
        icon: <BookOpen size={18} />,
        children: [
          { name: "New Booking", path: "/agent/bookings", icon: <FileText size={18} /> },
                { name: "confirm Booking", path: "/agent/update-booking", icon: <RefreshCw size={18} /> },
                 {name: "cancelled Booking " ,path:"/agent/canceld-booking",icon: <Ban size={18}/>}
         
        ],
      },

      {
          name: "Accounts",
          icon: <BookOpen size={18} />,
          children: [
            {name: "CustomerStatus" , path:"/agent/CustomerStatus" ,  icon : <Users size={18}/> },
            { name: "Cash Book", path: "/agent/accounts/cash-book", icon: <FileText size={18} /> },
            {name:"ShowLager" , path:"/agent/ShowLager" , icon:<RefreshCw size={18}/> }
            
          ],
          
        },
      {name: "Booking Sources", path:"/agent/booking-sources", icon:<Users size={18} />},
      //  {name: "Accounting" , path:"/agent/Accounting" ,  icon : <Users size={18}/> },
      {name: "Campany" , path:"/agent/campany" ,  icon :  <BuildingIcon size={18}/> },
       {name:"print ", path:"/agent/print" , icon:<Printer size={18}/>  },
     {name:"All Bill", path:"/agent/AllBill" , icon:<FileText size={18}/>  }
      
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-white via-blue-50 to-blue-200 shadow-lg min-h-screen flex flex-col justify-between border-r border-blue-300">
      
      <div>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg text-blue-600">🏢</span>
            </div>
            <h2 className="text-gray-800 font-semibold text-lg">Agent Portal</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Items */}
        {/* <ul className="mt-4 space-y-1 px-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center w-full text-left space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul> */
        
        <ul className="mt-4 space-y-1 px-4">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const isParentActive = item.children?.some(
          (child) => location.pathname === child.path
        );

        return (
          <li key={item.name}>
      
            <button
              onClick={() =>
                item.children ? toggleMenu(item.name) : navigate(item.path)
              }
              className={`flex items-center justify-between w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive || isParentActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </div>

              {item.children && (
                openMenu === item.name ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )
              )}
            </button>

          
            {item.children && openMenu === item.name && (
              <ul className="mt-1 ml-8 space-y-1 border-l border-gray-200 pl-3">
                {item.children.map((child) => {
                  const isChildActive = location.pathname === child.path;
                  return (
                    <li key={child.name}>
                      <button
                        onClick={() => navigate(child.path)}
                        className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md w-full text-left transition ${
                          isChildActive
                            ? "bg-blue-100 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {child.icon}
                        <span>{child.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>}
      </div>
    </div>
  );
}
