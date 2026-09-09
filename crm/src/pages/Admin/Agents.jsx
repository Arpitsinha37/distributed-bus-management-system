


import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import AddAgentModal from "./AddAgentModal";
import { getData ,putData,deleteData} from "../../services/apiService";

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await getData("/api/admin/getAllAgents");
      console.log(res);
      
      
      setData(res?.agents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  
  const toggleStatus = async(index) => {
   try {
      const agent = data[index];
      console.log(agent)
      
      const updatedStatus = agent.status === "active" ? "inactive" : "active";
      await putData(`/api/admin/update-agent-status/${agent.id}`, {  
        Agentstatus: updatedStatus
      });
    } catch (error) {
      console.error("Error updating agent status:", error);
      return;
    }
   
   
   
    const updated = [...data];
    updated[index].status =
      updated[index].status === "Active" ? "Inactive" : "Active";
    setData(updated);
  };

  const handleDelete = async(index) => {


    try {
      const agent = data[index];
      console.log(agent)   
      
      await deleteData(`/api/admin/delete-agent/${agent.id}`);
    } catch (error) {
      console.error("Error deleting agent:", error);
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this agent?")) {
      const updated = [...data];
      updated.splice(index, 1);
      setData(updated);
    }
  };

  return (
    <div className="p-6">
    
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Agents</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Agent
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-xl border border-gray-200">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-3 px-4 border-b">Full Name</th>
              <th className="py-3 px-4 border-b">Email</th>
              <th className="py-3 px-4 border-b">Phone</th>
              <th className="py-3 px-4 border-b">Location</th>
              <th className="py-3 px-4 border-b text-center">Status</th>
              <th className="py-3 px-4 border-b text-center">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No agents added yet.
                </td>
              </tr>
            ) : (
              data.map((a, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 border-b">{a.name}</td>
                  <td className="py-3 px-4 border-b">{a.email}</td>
                  <td className="py-3 px-4 border-b">{a.phone}</td>
                  <td className="py-3 px-4 border-b">{a.location}</td>

               
                  <td className="py-3 px-4 border-b text-center">
                    <div
                      onClick={() => toggleStatus(i)}
                      className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors ${
                        a.status === "Active" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition-transform ${
                          a.status === "Active"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs mt-1 font-medium ${
                        a.status === "Active" ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {a.status}
                    </p>
                  </td>

                  <td className="py-3 px-4 border-b text-center">
                    <div className="flex items-center justify-center gap-3">
              
                      <button
                        onClick={() => handleDelete(i)}
                        className="p-1.5 text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      {showModal && (
        <AddAgentModal
          onClose={() => setShowModal(false)}
          onAdd={(newAgent) =>
            setData([...data, { ...newAgent, status: "Active" }])
          }
        />
      )}
    </div>
  );
};

export default Agents;
