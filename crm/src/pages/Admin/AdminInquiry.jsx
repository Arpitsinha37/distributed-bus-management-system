import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { getInquiries, addInquiry } from "../../utils/storage";
import { getData, putData } from "../../services/apiService";

export default function AdminInquiry() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [agents, setAgents] = useState([]); 
  const [openAssignId, setOpenAssignId] = useState(null); 
  const [selectedAgents, setSelectedAgents] = useState([]); 


  useEffect(() => {

    const fetchInquiries = async () => {
      try {
        const data = await getData("/api/enquiries/getAllEnquiries");
        setInquiries(data.enquiries);
      }
      catch (error) {
        console.error("Error fetching inquiries:", error);
      }
    };
    fetchInquiries();
    getallagent();
  }, []);

  const getallagent = async () => {
    try {
      const data = await getData("/api/admin/getAllAgents");

      setAgents(data.agents);
      console.log("Agents:", data.agents);
    }
    catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  };

  const handleSave = (newInquiry) => {
    const data = { id: Date.now(), ...newInquiry };
    addInquiry("admin", data);
    setInquiries((prev) => [...prev, data]);
    setModalOpen(false);
  };

  const handleCheckboxChange = (agentId) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleAssign = async (inquiryId) => {


    console.log("Assigning inquiry:", inquiryId, "to agents:", selectedAgents);
    alert(`Inquiry ${inquiryId} assigned to agents: ${selectedAgents.join(", ")}`);
    try {
      const response = await putData("/api/enquiries/assign-enquiry", {
        agentId: selectedAgents[0],
        enquiryId: inquiryId,
      });
      console.log("Assign response:", response);
    }
    catch (error) {
      console.error("Error assigning inquiry:", error);
      alert("Failed to assign inquiry. Please try again.");
      return;
    }
    setOpenAssignId(null);
    setSelectedAgents([]);
  };

  return (
    <div className="p-6">
    
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Admin Inquiries
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
              <th className="px-4 py-2">InquiryStatus</th>
              <th className="px-4 py-2">AssignEnquiry</th>
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
                  <td className="px-4 py-2">{inq.enquirystatus}</td>
                  {/* <td className="px-4 py-2">{inq.assignenquiry}</td> */}

                  <td className="px-4 py-2 relative">
                    {inq.role === "admin" ? (
                      <>
                        <div className="flex items-center gap-2 relative">
                         
                          {openAssignId === inq.id && (
                            <div className="absolute left-[-220px] bg-white border shadow-lg rounded-lg p-3 w-52 z-20">
                              <p className="font-semibold text-gray-700 mb-2">Select Agent</p>
                              <select
                                className="w-full border rounded px-2 py-1 mb-3"
                                value={selectedAgents[0] || ""}
                                onChange={(e) => setSelectedAgents([e.target.value])}
                              >
                                <option value="">-- Select Agent --</option>
                                {agents.map((agent) => (
                                  <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                  </option>
                                ))}
                              </select>

                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setOpenAssignId(null)}
                                  className="text-gray-500 hover:underline"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAssign(inq.id)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                  Assign
                                </button>
                              </div>
                            </div>
                          )}

                          
                          <button
                            onClick={() =>
                              setOpenAssignId(openAssignId === inq.id ? null : inq.id)
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Assign Inquiry
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Not allowed</span>
                    )}
                  </td>



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

