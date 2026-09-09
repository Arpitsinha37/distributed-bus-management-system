import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { getInquiries, addInquiry } from "../../utils/storage";
import { getData } from "../../services/apiService";

export default function AgentInquiry() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const agentID= sessionStorage.getItem("agentID");
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const data = await getData("/api/enquiries/agent/enquiries/"+agentID);  
        console.log(data);
        
        setInquiries(data?.data || []);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      }
    };
    fetchInquiries();
    
  }, []);



  const handleSave = (newInquiry) => {
    const data = { id: Date.now(), ...newInquiry };
    addInquiry("agent", data);
    setInquiries((prev) => [...prev, data]);
    setModalOpen(false);
  };

  return (
    <div className="p-6">
    
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My Inquiries</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + New Inquiry
        </button>
      </div>

 
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2">Mode</th>
              <th className="px-4 py-2">Booking Date</th>
              <th className="px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length > 0 ? (
            
              inquiries.map((inq) => (
                <tr key={inq.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{inq.name}</td>
                  <td className="px-4 py-2">{inq.email}</td>
                  <td className="px-4 py-2">{inq.mobile}</td>
                  <td className="px-4 py-2 capitalize">{inq.mode}</td>
                  <td className="px-4 py-2">{inq.bookingDate}</td>
                  <td className="px-4 py-2">{inq.role}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No inquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
