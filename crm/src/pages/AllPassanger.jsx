

import React, { useEffect, useState, useMemo } from "react";
import { getData, putData } from "/src/services/apiService";


const AllPassanger = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editPassenger, setEditPassenger] = useState({
    id: "",
    honorifics: "",
    name: "",
    age: "",
    gender: "",
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const res = await getData("/api/passengers/passengers");
        setPassengers(res?.passengers || []);
      } catch (error) {
        console.error("GET ALL PASSENGERS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPassengers();
  }, []);
    console.log(passengers);
  
  
  const filteredPassengers = useMemo(() => {
    if (!search.trim()) return passengers;

    return passengers.filter((p) =>
      `${p.name} ${p.gender}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [passengers, search]);

 
  const handleUpdatePassenger = async () => {
    try {
      await putData(
        // `/api/passengers/bookings/${editPassenger?.type}/${editPassenger?.bookingId}/passengers`,
        `/api/passengers/${editPassenger?.id}`,
        
        editPassenger
      );

      setPassengers((prev) =>
        prev.map((p) =>
          (p.id || p._id) === editPassenger.id
            ? { ...p, ...editPassenger }
            : p
        )
      );

      setIsEditOpen(false);
    } catch (error) {
      console.error("UPDATE PASSENGER ERROR:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Passengers</h2>

      <input
        type="text"
        placeholder="Search..."
        className="border p-2 rounded w-72 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading passengers...</p>
      ) : filteredPassengers.length === 0 ? (
        <p>No passengers found</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Honorifics</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Age</th>
              <th className="border px-2 py-1">Gender</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPassengers.map((p, index) => (
              <tr key={p.id || p._id || index} className="text-center">
                <td className="border px-2 py-1">{index + 1}</td>
                <td className="border px-2 py-1">{p.honorifics}</td>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1">{p.age}</td>
                <td className="border px-2 py-1">{p.gender}</td>
                <td className="border px-2 py-1">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => {
                      setEditPassenger({
                        ...p
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
      )}

     
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Passenger</h3>

            <input
              className="border w-full mb-2 px-2 py-1"
              placeholder="Honorifics"
              value={editPassenger.honorifics}
              onChange={(e) =>
                setEditPassenger({
                  ...editPassenger,
                  honorifics: e.target.value,
                })
              }
            />

            <input
              className="border w-full mb-2 px-2 py-1"
              placeholder="Name"
              value={editPassenger.name}
              onChange={(e) =>
                setEditPassenger({
                  ...editPassenger,
                  name: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="border w-full mb-2 px-2 py-1"
              placeholder="Age"
              value={editPassenger.age}
              onChange={(e) =>
                setEditPassenger({
                  ...editPassenger,
                  age: e.target.value,
                })
              }
            />

            <select
              className="border w-full mb-4 px-2 py-1"
              value={editPassenger.gender}
              onChange={(e) =>
                setEditPassenger({
                  ...editPassenger,
                  gender: e.target.value,
                })
              }
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="border px-3 py-1"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </button>

              <button
                className="bg-blue-600 text-white px-3 py-1"
                onClick={handleUpdatePassenger}
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

export default AllPassanger;
