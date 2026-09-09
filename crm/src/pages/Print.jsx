


import React, { useEffect, useState, useRef } from "react";
import { getData } from "/src/services/apiService";
import { useLocation } from "react-router-dom";

const Print = () => {
  const [billNo, setBillNo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDropdown, setCompanyDropdown] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extraAmount, setExtraAmount]  = useState(0)

  const dropdownRef = useRef(null);
  const location=useLocation();
  const BillNo = location.state?.billNo;
 console.log(BillNo);

 if(BillNo && billNo!==BillNo ){
  setBillNo(BillNo);
 }
 

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getData("/api/company/get-companies");
        if (Array.isArray(res?.companies)) setCompanyList(res.companies);
      } catch (err) {
        console.error("Error loading companies:", err);
      }
    };
    fetchCompanies();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCompanyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSearch = async () => {
    if (!billNo) return alert("Please enter Bill No.");
    if (!selectedCompany) return alert("Please select Company");

    try {
      setLoading(true);
      const res = await getData(`/api/invoices/bill/${billNo}`);
      if (!res || res.success === false) return alert("Bill not found");
      if(selectedCompany.gstNumber){
        setExtraAmount((Number(res.invoice.bookingUpdate.typeServiceCharge) + Number(res.invoice.bookingUpdate.bookingCharge)) * 0.18)
      }
      setPayments(res.payments || []);
      setBillData(res.invoice || res);
      setShowBill(true);
    } catch (error) {
      console.error("Error fetching bill:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    setShowBill(false);
    setBillNo("");
    setSelectedCompany(null);
    setCompanyName("");
    setBillData(null);
  };


  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">

      <style>
        {`
        @media print {
          body * { visibility: hidden; }
          #printModal, #printModal * { visibility: visible; }
          #printModal { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}
      </style>


      {!showBill && (
        <div className="w-[450px] mx-auto mt-10 p-6 border rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-center">Enter Bill Details</h2>

          <input
            type="text"
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            placeholder="Enter Bill No."
            className="border px-3 py-2 w-full rounded mb-4"
          />


          <div className="relative" ref={dropdownRef}>
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
                    const name = c.companyName || c.name;
                    return (
                      <div
                        key={c._id || c.id}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          setCompanyName(name);
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

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 mt-4 rounded"
          >
            {loading ? "Searching..." : "Proceed"}
          </button>
        </div>
      )}


      {showBill && billData && selectedCompany && (
        <div className="inset-0 bg-black/50 flex items-center justify-center p-4">
          <div
            id="printModal"
            className="bg-white w-[850px] border p-8 rounded shadow-lg"
          >

            <div className="flex justify-end gap-3 mb-4 no-print">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Print
              </button>
            </div>


            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">{selectedCompany.companyName || selectedCompany.name}</h1>
              <p>{selectedCompany.address || selectedCompany.addressLine1}</p>
              <p>{selectedCompany.phone || ""}</p>
              <hr className="border-t-2 mt-3" />
            </div>


            <div className="border p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <p><strong>Bill No:</strong> {billData.billNo}</p>
                  <p><strong>Name:</strong> {billData.client?.name}</p>
                  <p><strong>Mobile:</strong> {billData.client?.phone}</p>
                  <p><strong>Email:</strong> {billData.client?.email}</p>
                  <p><strong>PNR number:</strong> {billData.bookingUpdate?.pnrNumber || billData.bookingUpdate?.pnrNumber}</p>
                  <p><strong>TO:</strong> {billData.booking?.toStation || billData.booking?.toAirport || billData.booking?.toStop}</p>
                  <p><strong>From:</strong> {billData.booking?.fromStation || billData.booking?.fromAirport || billData.booking?.fromStop}</p>
                  <p><strong>Class:</strong> {billData.booking?.classType || billData.booking?.travelClass || billData.booking?.busType}</p>

                </div>
                <div>
                  <p><strong>Date:</strong> {new Date(billData.createdAt).toLocaleDateString()}</p>
                  <p><strong>Travel Date:</strong> {billData.booking?.departureDate || billData.booking?.departureDateTime}</p>
                </div>
              </div>

              <div className="flex justify-between mt-4">

                <div className="border p-3 w-[48%] text-sm">
                  <h3 className="mt-3 underline font-bold">Passenger Details</h3>
                  {billData.passengers && billData.passengers.length > 0 ? (
                    <table className="w-full text-left border mt-2 text-sm">
                      <thead>
                        <tr>
                          <th className="border px-2">Name</th>
                          <th className="border px-2">Type</th>
                          <th className="border px-2">Age</th>
                          <th className="border px-2">Gender</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billData.passengers.map((p) => (
                          <tr key={p.id}>
                            <td className="border px-2">{p.name}</td>
                            <td className="border px-2">{p.type}</td>
                            <td className="border px-2">{p.age}</td>
                            <td className="border px-2">{p.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No passengers found.</p>
                  )}
                </div>


               

                <div className="border p-3 w-[48%] text-sm">
                  <table className="w-full text-right">
                    <tbody>
                     
                      <tr>
                        <td className="border px-2">Ticket Cost</td>
                        <td className="border px-2">{billData.bookingUpdate?.ticketAmount || 0}</td>
                      </tr>
                      <tr>
                        <td className="border px-2">Booking Charge</td>
                        <td className="border px-2">{billData.bookingUpdate?.bookingCharge || 0}</td>
                      </tr>
                      <tr>
                        <td className="border px-2">Service Charge</td>
                        <td className="border px-2">{billData.bookingUpdate?.typeServiceCharge || 0}</td>
                      </tr>

                      {selectedCompany.gstNumber ? 
                       <tr>
                        <td className="border px-2">GST Amount</td>
                        <td className="border px-2">{extraAmount}</td>
                      </tr> :null  
                    }
                    
                        
                      <tr>
                        
                        <td className="border font-bold px-2">Total</td>
                        <td className="border font-bold px-2">{Number(billData.bookingUpdate?.totalAmount)+Number(extraAmount) || 0}</td>
                       
                      </tr>

                     
                      <tr>
                        <td className="border px-2">Cancellation Refund (₹)</td>
                        <td className="border px-2">{billData.cancelledBooking?.cancellationCharge || 0}</td>
                      </tr>
                      <tr>
                        <td className="border px-2">Service Charge (Cancellation)</td>
                        <td className="border px-2">{billData.cancelledBooking?.serviceChargeCancellation || 0}</td>
                      </tr>
                      <tr>
                        <td className="border px-2">Paid Amount</td>
                        <td className="border px-2">{billData.cancelledBooking?.paidAmount || payments[0]?.receivingAmount || 0}</td>
                      </tr>
                      <tr>
                        <td className="border px-2">Cancellation Remaining</td>
                        <td className="border px-2">{billData.cancelledBooking?.remainingAmount || 0}</td>
                      </tr>



                      <tr>
                        <td className="border font-bold px-2">Balance To Pay</td>
                        <td className="border font-bold px-2">{ Number(billData.cancelledBooking?.remainingAmount || payments.length > 0 && (payments[0].totalRemainingBalance)  || billData?.bookingUpdate?.totalAmount) + Number(extraAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>


              </div>

              <p className="text-center mt-4 italic">"We Assure Best Service Always"</p>

              <div className="flex gap-3 mt-10">
                <p>For :</p>
                <p className="font-bold">{selectedCompany.companyName || selectedCompany.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Print; 
