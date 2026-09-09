


import React, { useEffect, useState, useMemo } from "react";
import { getData, putData } from "/src/services/apiService";

const Allclients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);


  const [search, setSearch] = useState("");

  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editClient, setEditClient] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
  });


  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getData("/api/clients/list");
        setClients(res?.clients || []);
      } catch (error) {
        console.error("GET ALL CLIENTS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;

    return clients.filter((c) => {
      const str = `${c.name} ${c.email} ${c.phone}`.toLowerCase();
      return str.includes(search.toLowerCase());
    });
  }, [clients, search]);


  const handleUpdateClient = async () => {
    try {
      await putData(`/api/clients/${editClient.id}`, {
        name: editClient.name,
        email: editClient.email,
        phone: editClient.phone,
      });

     
      setClients((prev) =>
        prev.map((c) =>
          (c.id || c._id) === editClient.id
            ? { ...c, ...editClient }
            : c
        )
      );

      setIsEditOpen(false);
    } catch (err) {
      console.error("UPDATE CLIENT ERROR:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Clients</h2>

      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          className="border p-2 rounded w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading clients...</p>
      ) : filteredClients.length === 0 ? (
        <p>No clients found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Client-Id</th>
                <th className="border px-3 py-2">Name</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Phone</th>
                <th className="border px-3 py-2">Remaining Balance</th>
                <th className="border px-3 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client, index) => (
                <tr
                  key={client.id || client._id || index}
                  className="text-center"
                >
                  <td className="border px-3 py-2">{index + 1}</td>
                  <td className="border px-3 py-2">
                    {client.id || client._id}
                  </td>
                  <td className="border px-3 py-2">{client.name}</td>
                  <td className="border px-3 py-2">{client.email}</td>
                  <td className="border px-3 py-2">{client.phone}</td>
                  <td className="border px-3 py-2">
                    {client.remainingBalance}
                  </td>
                  <td className="border px-3 py-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => {
                        setEditClient({
                          id: client.id || client._id,
                          name: client.name,
                          email: client.email,
                          phone: client.phone,
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

     
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Client</h3>

            <input
              className="border w-full mb-3 px-2 py-1"
              placeholder="Name"
              value={editClient.name}
              onChange={(e) =>
                setEditClient({ ...editClient, name: e.target.value })
              }
            />

            <input
              className="border w-full mb-3 px-2 py-1"
              placeholder="Email"
              value={editClient.email}
              onChange={(e) =>
                setEditClient({ ...editClient, email: e.target.value })
              }
            />

            <input
              className="border w-full mb-4 px-2 py-1"
              placeholder="Phone"
              value={editClient.phone}
              onChange={(e) =>
                setEditClient({ ...editClient, phone: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="border px-3 py-1"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>

              <button
                className="bg-blue-600 text-white px-3 py-1"
                onClick={handleUpdateClient}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allclients;
