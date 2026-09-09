

import React, { useEffect, useState, useMemo } from "react";
import { getData } from "/src/services/apiService";
import { FaPrint } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const AllBill = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);


  const [search, setSearch] = useState("");


  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");


  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();
  const handleViewBill = (billNo) => {
    navigate(`/bill-view/${billNo}`);
  };
const role = sessionStorage.getItem("role")

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await getData("/api/invoices/allBills");
        setBills(res?.invoices || []);
      } catch (error) {
        console.error("GET ALL BILLS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);


  const filteredBills = useMemo(() => {
    let data = [...bills];


    if (search.trim() !== "") {
      data = data.filter((b) => {
        const str = `${b.billNo} ${b.client?.name} ${b.client?.email} ${b.client?.phone} ${b.reference}`
          .toLowerCase();
        return str.includes(search.toLowerCase());
      });
    }


    if (sortField) {
      data.sort((a, b) => {
        const valA = a[sortField] ?? "";
        const valB = b[sortField] ?? "";

        if (sortOrder === "asc") return valA > valB ? 1 : -1;
        else return valA < valB ? 1 : -1;
      });
    }

    return data;
  }, [bills, search, sortField, sortOrder]);


  const totalPages = Math.ceil(filteredBills.length / pageSize);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Bills</h2>


      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search by name, bill no, phone..."
          className="border p-2 rounded w-72"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading bills...</p>
      ) : filteredBills.length === 0 ? (
        <p>No bills found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">#</th>

                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("billNo")}
                >
                  Bill No
                </th>

                <th className="border px-3 py-2">Client Name</th>
                <th className="border px-3 py-2">Email</th>
                <th className="border px-3 py-2">Phone</th>
                <th className="border px-3 py-2">Booking Type</th>

                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  Type
                </th>

                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("totalAmount")}
                >
                  Amount
                </th>

                <th className="border px-3 py-2">Reference</th>
                

                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Update Date
                </th>
                <th className="booder px-3 py-2 cursor-pointer">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedBills.map((bill, index) => (
                <tr key={bill.id} className="text-center">
                  <td className="border px-3 py-2">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  <td className="border px-3 py-2">{bill.billNo}</td>
                  <td className="border px-3 py-2">{bill.client?.name || "N/A"}</td>
                  <td className="border px-3 py-2">{bill.client?.email || "N/A"}</td>
                  <td className="border px-3 py-2">{bill.client?.phone || "N/A"}</td>
                  <td className="border px-3 py-2">{bill.bookingType}</td>
                  <td className="border px-3 py-2">{bill.type}</td>
                  <td className="border px-3 py-2">₹{bill.totalAmount}</td>
                  <td className="border px-3 py-2">{bill.reference}</td>
                 
                  <td className="border px-3 py-2">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border px-3 py-2">
                    <div className="flex justify-center gap-3">



                      <button
                        onClick={() =>
                          navigate(`/${role}/print`, {
                            state: { billNo: bill.billNo }
                          })
                        }
                        className="text-green-600 hover:text-green-800"
                        title="Print Bill"
                      >
                        <FaPrint size={18} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

  
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              ⬅ Prev
            </button>

            <span>
              Page <strong>{currentPage}</strong> of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next ➡
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBill;

