import React, { useState } from "react";
import { postData } from "../services/apiService";
export default function Modal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    mode: "",
    bookingDate: "",
  
  });

  if (!isOpen) return null;
 


   
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await postData("/api/enquiries/create/enquiry", form);
    console.log(response);
    alert(" Inquiry Added Successfully!");
    setForm({ name: "", email: "", mobile: "", mode: "bus", bookingDate: "" });
    onClose(); 
  } catch (err) {
    console.error("Error saving inquiry:", err);
    alert(" Failed to save inquiry. Please try again.");
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-30 z-50">
      <div className="bg-white w-[400px] p-6 rounded-xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">New Inquiry</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Mobile Number</label>
            <input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter mobile number"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Mode of Journey</label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Flight">Flight</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Booking Date</label>
            <input
              name="bookingDate"
              type="date"
              value={form.bookingDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
            
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
