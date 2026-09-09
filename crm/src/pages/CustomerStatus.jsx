

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getData } from "/src/services/apiService";
import Demo from "./Booking/Demo";

const CustomerStatus = () => {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showData, setShowData] = useState(false);

  const [companyDropdown, setCompanyDropdown] = useState(false);
  const [companyID, setCompanyID] = useState("");

  const [companyList, setCompanyList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null); 

  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
 
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    clientID: "",
  });

  let clientId = formData?.clientID;
   console.log( "akpid");
   
    console.log(apiResponse);
    
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getData("/api/company/get-companies");
        if (Array.isArray(res?.companies)) {
          setCompanyList(res.companies);
        }
      } catch (err) {
        console.error("Error loading companies:", err);
      }
    };
    fetchCompanies();
  }, []);


  const handleShow = async () => {
    if (!clientId) {
      alert("Please select Client from Demo Component!");
      return;
    }
    // if (!companyID) {
    //   alert("Please select Company!");
    //   return;
    // }

    setLoading(true);

    try {
      const res = await getData(`/api/customer-statement/${clientId}`);

      setApiResponse(res);
      setShowData(true);
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to fetch customer statement");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center mt-4">
      <div className="p-4 w-full max-w-5xl shadow-lg rounded-lg border bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center">Customer Status</h1>

        <div className="grid grid-cols-4 gap-4">

          
          <div className="relative">
            <label className="font-semibold">Client Name</label>
            <Demo fromdata={formData} setFormData={setFormData} />
          </div>

          
          <div className="relative">
            <label className="font-semibold">From Date</label>
            <input
              type="date"
              className="border p-2 w-full rounded"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          
          <div className="relative">
            <label className="font-semibold">To Date</label>
            <input
              type="date"
              className="border p-2 w-full rounded"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

        
          <div className="relative">
            <label className="font-semibold">Company</label>
            <div className="relative">
              <input
                type="text"
                className="border p-2 w-full rounded"
                placeholder="Type or Select Company"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setCompanyDropdown(true);
                }}
                onFocus={() => setCompanyDropdown(true)}
              />

              {companyDropdown && (
                <div className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto shadow">
                  {companyList
                    .filter((c) =>
                      (c.companyName || c.name || "")
                        .toLowerCase()
                        .includes(companyName.toLowerCase())
                    )
                    .map((c) => {
                      let name = c.companyName || c.name;
                      return (
                        <div
                          key={c._id}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => {
                            setCompanyName(name);
                            setCompanyID(c._id);
                            setSelectedCompany(c); 
                            setCompanyDropdown(false);
                          }}
                        >
                          {name}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={handleShow}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Loading..." : "Show"}
          </button>
        </div>

        

        {showData && apiResponse && (
          <div className="mt-5 p-6 bg-white border rounded shadow-md">

         
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">
                {selectedCompany?.companyName ||
                  selectedCompany?.name ||
                  "Company Name"}
              </h1>

              <p className="text-sm">
                {selectedCompany?.addressLine1 || "Address not available"}
              </p>

              <p className="text-sm">
                {selectedCompany?.phone || "Phone not available"}
              </p>

              <hr className="border-t-2 mt-2" />
            </div>

            <div className="flex justify-between mb-4 text-sm font-medium">
              <div>
                Name:{" "}
                <span className="font-normal">
                  {formData.clientName || "N/A"}
                </span>
              </div>

              <div>
                Date From: <span className="font-normal">{fromDate}</span> To:{" "}
                <span className="font-normal">{toDate}</span>
              </div>
            </div>  

           
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-3 py-2">S. No.</th>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Cr</th>
                  <th className="border px-3 py-2">Dr</th>
                  <th className="border px-3 py-2">Balance</th>
                  <th className="border px-3 py-2">T.No.</th>
                  <th className="border px-3 py-2">Remark</th>
                </tr>
              </thead>

              <tbody>
                {apiResponse.statement?.map((item, index) =>{
                  const remark = item.invoice.billNo+", "+item.bookingUpdateDetails.pnrNumber+", " + (item.bookingDetails.fromAirport|| item.bookingDetails.fromStation||item.bookingDetails.fromStop)+ ","+(item.bookingDetails.toAirport||item.bookingDetails.toStation||item.bookingDetails.toStop)+ ", " + item.bookingDetails.totalPassengers +" , "+ (item.bookingUpdateDetails.journeyDate ||item.bookingDetails.departureDate||item.bookingDetails.departureDateTime  )+", " +(item.bookingDetails.travelClass||item.bookingDetails.classType||item.bookingDetails.busType)+", "+ item.bookingUpdateDetails.totalAmount;
                  return (
                  <tr key={item.id}>
                    <td className="border px-3 py-1 text-center">
                      {index + 1}
                    </td>

                    <td className="border px-3 py-1">
                      {new Date(item.bookingDetails.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td className="border px-3 py-1 text-right">
                      {item.credit ?? 0}
                    </td>

                    <td className="border px-3 py-1 text-right">
                      {item.debit ?? 0}
                    </td>

                    <td className="border px-3 py-1 text-right">
                      {item.bookingUpdateDetails.totalAmount ?? 0}
                    </td>

                    <td className="border px-3 py-1 text-center">
                      {item.bookingUpdateDetails.ticketNumber || "None"}
                    </td>

                    <td className="border px-3 py-1">{remark}</td>
                  </tr>
                )
                } 
               )}
              </tbody>

              <tfoot>
                <tr className="font-bold bg-gray-100">
                  <td className="border px-3 py-1 text-center" colSpan={2}>
                    Total
                  </td>

                  <td className="border px-3 py-1 text-right">
                    {apiResponse.statement?.reduce(
                      (sum, i) => sum + (i.credit ?? 0),
                      0
                    )}
                  </td>

                  <td className="border px-3 py-1 text-right">
                    {apiResponse.statement?.reduce(
                      (sum, i) => sum + (i.debit ?? 0),
                      0
                    )}
                  </td>

                  <td className="border px-3 py-1 text-right">
                    {apiResponse.statement?.length
                      ? apiResponse.statement[
                          apiResponse.statement.length - 1
                        ].balanceAfter
                      : 0}
                  </td>

                  <td className="border px-3 py-1" colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStatus;
