

import React, { useState ,useEffect} from "react";
import { postData,getData } from "../../services/apiService";

const AddAgentModal = ({ onClose, onAdd }) => {
  const [agent, setAgent] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgent({ ...agent, [name]: value });
  };

  const handleSubmit = async() => {
    if (!agent.name || !agent.email || !agent.phone || !agent.location) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res=await postData("/api/admin/create-agent", agent);
      console.log(res);
      
    } catch (error) {
      console.error("Error adding agent:", error);
      alert("Failed to add agent. Please try again.");
      return;
    }

    onAdd(agent);
    setAgent({ name: "", email: "", phone: "", location: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
      <div className="bg-white w-[480px] rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Agent
            </h2>
            <p className="text-sm text-gray-500">
              Fill in the details below to add a new travel agent to the system.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Enter agent name"
              value={agent.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="agent@travel.com"
              value={agent.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              placeholder="+91 98765 43210"
              value={agent.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              name="location"
              type="text"
              placeholder="City"
              value={agent.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-white hover:text-blue-900"
          >
            Add Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAgentModal;
