



import React, { useState, useEffect } from "react";
import { FaSort, FaSortUp, FaSortDown, FaEdit, FaEye, FaSyncAlt, FaTimes } from "react-icons/fa";
import { getData } from "../../services/apiService";
import { useNavigate } from "react-router-dom";

const AgentBookingTable = () => {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 8;
  const navigate = useNavigate();
  const roll = sessionStorage.getItem("role");
  const agentid = sessionStorage.getItem("agentID");
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getData("/api/dashboard/agent-bookings/" + agentid);
      setData(response.bookings || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handlechange = (booking) => {
    let type = booking?.type
    let mode = ""
    if (type === "Railway") {
      mode = "rail"
    } else if (type === "Flight") {
      mode = "flight"
    } else {
      mode = "bus"
    }
    navigate(`/${roll}/editbookingform-${mode}/${booking.id}`)
  }

  const handleUpdate = (booking) => {

    console.log("muee", booking);

    let type = booking?.type
    let mode = ""
    if (type === "Railway") {
      mode = "train"
    } else if (type === "Flight") {
      mode = "flight"
    } else {
      mode = "bus"
    }



    navigate(`/${roll}/booking/update-booking/${mode}/${booking.id}`)
  };


  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const filteredData = data
    .filter((item) => {
      if (filter === "all") return true;
      return item.type?.toLowerCase() === filter.toLowerCase();
    })
    .filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );


  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    let valA = a[sortColumn];
    let valB = b[sortColumn];


    if (sortColumn === "date" || sortColumn === "createdAt") {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });


  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const goToPage = (page) => setCurrentPage(page);

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow">

      <div className="mb-4 flex justify-between items-center">

        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />


        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="Bus">Bus</option>
          <option value="Railway">Train</option>
          <option value="Flight">Flight</option>
        </select>
      </div>


      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              {[
                { key: "bookingId", label: "Booking ID" },
                { key: "userName", label: "User Name" },
                { key: "mode", label: "Mode" },
                // { key: "amount", label: "Amount" },
                { key: "date", label: "Date" },
                { key: "fromTo", label: "Route" },
                { key: "bookedBy", label: "Booked By" },


                { key: "bookingStatus", label: "Status" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">
                    {col.label}
                    {sortColumn === col.key ? (
                      sortOrder === "asc" ? (
                        <FaSortUp className="ml-1" />
                      ) : (
                        <FaSortDown className="ml-1" />
                      )
                    ) : (
                      <FaSort className="ml-1 text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.clientSnapshotName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {row.type}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{row.fare}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.departureDateTime || row.departureDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {row.fromAirport || row.fromStation || row.fromStop} → {row.toAirport || row.toStation || row.toStop}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {row.bookedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.bookingStatus}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 flex space-x-3">
                    <button className="text-blue-500 hover:text-blue-700"
                      onClick={() => handlechange(row)}
                    >

                      <FaEdit />
                    </button>

                    <button
                      className="text-yellow-500 hover:text-yellow-700"
                      onClick={() => handleUpdate(row)}
                    >
                      <FaSyncAlt />
                    </button>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing <b>{indexOfFirstRow + 1}</b> to{" "}
          <b>{Math.min(indexOfLastRow, sortedData.length)}</b> of{" "}
          <b>{sortedData.length}</b> results
        </p>

        <div className="flex space-x-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded-md ${currentPage === 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-400 hover:bg-blue-100"
              }`}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 border rounded-md ${currentPage === i + 1
                  ? "bg-blue-500 text-white border-blue-500"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border rounded-md ${currentPage === totalPages
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-400 hover:bg-blue-100"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentBookingTable;
