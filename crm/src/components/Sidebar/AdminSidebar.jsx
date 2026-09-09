


import React from "react";
import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  FileText, 
  X, 
  RefreshCw, 
  Ban ,
   ChevronDown,
  ChevronRight,

  BuildingIcon,
  Printer,
  User,
  BookImageIcon,
  // pageXOffset

} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (name) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <BarChart3 size={18} /> },
    { name: "Agent Management", path: "/admin/agents", icon: <Users size={18} /> },
    // { name: "Inquiry", path: "/admin/inquiry", icon: <FileText size={18} /> },
    // { name: "Bookings", path: "/admin/bookings", icon: <BookOpen size={18} /> },
    {
    name: "Bookings",
    icon: <BookOpen size={18} />,
    children: [
      { name: "New Booking", path: "/admin/bookings", icon: <FileText size={18} /> },
      { name: "Ticket Genrator", path: "/admin/update-booking", icon: <RefreshCw size={18} /> },
      {name: "cancelled Booking " ,path:"/admin/canceld-booking",icon: <Ban size={18}/>}

    ],
    
  },
   {
    name: "Accounts",
    icon: <BookOpen size={18} />,
    children: [
      {name: "CustomerStatus" , path:"/admin/CustomerStatus" ,  icon : <Users size={18}/> },
      { name: "Cash Book", path: "/admin/accounts/cash-book", icon: <FileText size={18} /> },
      {name:"ShowLager" , path:"/admin/ShowLager" , icon:<RefreshCw size={18}/> }
      
    ],
    
  },
  {name:"allpassanger",path:"/admin/allpassanger",icon:<User size={18}/>},
    {name:"allclient",path:"/admin/allclient",icon:<User size={18}/>},
    {name: "Booking Sources", path:"/admin/booking-sources", icon:<BookImageIcon size={18} />},
    // {name: "Accounting" , path:"/admin/Accounting" ,  icon : <Users size={18}/> },

    {name: "Campany" , path:"/admin/campany" ,  icon :  <BuildingIcon size={18}/> },
     {name:"print ", path:"/admin/print" , icon:<Printer size={18}/>  },
     {name:"All Bill", path:"/admin/AllBill" , icon:<FileText size={18}/>  }
    

  ];

  return (
    <div className="w-64 bg-gradient-to-b from-white via-purple-50 to-purple-200 shadow-lg min-h-screen flex flex-col justify-between border-r border-purple-300">
     
      <div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-300 bg-gradient-to-r from-purple-100 via-white to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-lg text-white font-semibold"></span>
            </div>
            <h2 className="text-purple-700 font-semibold text-lg">Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-purple-500 hover:text-purple-700 transition"
          >
            <X size={18} />
          </button>
        </div>

    
         <ul className="mt-4 space-y-1 px-4">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const isParentActive = item.children?.some((child) => location.pathname === child.path);

        return (
          <li key={item.name}>
           
            <button
              onClick={() =>
                item.children ? toggleMenu(item.name) : navigate(item.path)
              }
              className={`flex items-center justify-between w-full text-left space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive || isParentActive
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md"
                  : "text-purple-800 hover:bg-gradient-to-r hover:from-purple-100 hover:to-white hover:shadow-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              {item.children &&
                (openMenu === item.name ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                ))}
            </button>


         
            {item.children && openMenu === item.name && (
              <ul className="mt-1 ml-8 space-y-1 border-l border-purple-200 pl-3">
                {item.children.map((child,o) => {
                  const isChildActive = location.pathname === child.path;
                  return (
                    <li key={o}>
                      <button
                        onClick={() => navigate(child.path)}
                        className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md w-full text-left transition ${
                          isChildActive
                            ? "bg-purple-100 text-purple-700 font-medium"
                            : "text-gray-700 hover:text-purple-700 hover:bg-purple-50"
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
    </ul>
      </div>
    </div>
  );
}
