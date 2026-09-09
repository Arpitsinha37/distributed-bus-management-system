import React, { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { getData } from "/src/services/apiService";

const ShowLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [filteredLedger, setFilteredLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

 
  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const res = await getData("/api/ledger/all");

        if (res?.success) {
          setLedger(res.data || []);
          setFilteredLedger(res.data || []);
        } else {
          setError("Failed to load ledger");
        }
      } catch (err) {
        console.error(err);
        setError("Server Error");
      }
      setLoading(false);
    };

    fetchLedger();
  }, []);

  useEffect(() => {
    const filtered = ledger.filter((item) => {
      const q = searchQuery.toLowerCase();

      return (
        item.client?.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.bookingType?.toLowerCase().includes(q) ||
        item.paymentMode?.toLowerCase().includes(q)
      );
    });

    setFilteredLedger(filtered);
  }, [searchQuery, ledger]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Show Ledger</h1>

     
      <div className="flex items-center gap-3 mb-5 bg-white shadow p-3 rounded-lg border">
        <Search className="text-gray-500" />
        <input
          type="text"
          placeholder="Search by client, description, booking, payment mode..."
          className="w-full outline-none text-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

     
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

     
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

   
      {!loading && filteredLedger.length === 0 && (
        <p className="text-center text-gray-500">No ledger records found.</p>
      )}

  
      {!loading && filteredLedger.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Booking</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Debit</th>
                <th className="p-3 text-right">Credit</th>
                <th className="p-3 text-right">Payment Mode</th>
                <th className="p-3 text-right">remainingBalance</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredLedger.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-center">{i + 1}</td>

                  <td className="p-3">
                    <div className="font-semibold">{row.client?.name}</div>
                    <div className="text-xs text-gray-500">
                      {row.client?.phone}
                    </div>
                  </td>

                  <td className="p-3 capitalize">{row.bookingType}</td>

                  <td className="p-3">
                    {row.description || <span className="text-gray-400">—</span>}
                  </td>

              
                  <td className="p-3 text-right text-red-600 font-semibold">
                    {row.entryType === "debit" ? row.amount : "—"}
                  </td>

                 
                  <td className="p-3 text-right text-green-600 font-semibold">
                    {row.entryType === "credit" ? row.amount : "—"}
                  </td>

                  <td className="p-3 text-right capitalize">{row.paymentMode}</td>

                  <td className="p-3 text-right font-bold">
                    {row.remainingBalance}
                  </td>

                  <td className="p-3">
                    {new Date(row.transactionDate).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowLedger;
