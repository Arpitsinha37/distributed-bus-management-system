

import React, { useEffect, useState } from "react";
import { getData, postData } from "../../services/apiService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaWallet,
  FaDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

const ConfirmedBookings = () => {
  const { id: bookingId } = useParams();
  console.log(bookingId);

  const [bookings, setBookings] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const navigate = useNavigate();
  const roll = sessionStorage.getItem("role");

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [paymentType, setPaymentType] = useState("");

  const [clintBalance, setClintBalance] = useState();
   const agentid = sessionStorage.getItem("agentID");
   console.log(agentid,"agent idddddd");
   
const role=sessionStorage.getItem("role")
  const [formData, setFormData] = useState({
    totalRemainingBalance: "",
    totalAmount: "",
    receivingDate: "",
    paymentAmount: "",
   ticketRemainingAmount: 0,
    bankName: "",
    transactionId: "",
    transactionDate: "",

    cardNumber: "",
    cardType: "",
    cardHolderName: "",
    cardTransactionDate: "",

    upiId: "",
    upiTransactionId: "",
    upiTransactionDate: "",

    chequeNumber: "",
    chequeBankName: "",
    chequeTransactionDate: "",
    Cash:"",
  });

  
  const openModal = (booking) => {
    getuserPaymentData(booking);
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getuserPaymentData = async (booking) => {
    let type = "flight";
    const bookingType = booking?.type;
    if (bookingType === "Bus") {
      type = "bus"
    }
    else if (bookingType === "Rail") {
      type = "rail"
    }
    else {
      type = "flight"
    }
    try {


      const response = await getData(`/api/payments/client/${booking?.bookingId}/${type}/invoice`,);
      // if (response.success) setBookings(response.bookings);
      setClintBalance(response);
      setFormData((pre) => ({
        ...pre,
        totalAmount: response?.totalBookingAmount,
        totalRemainingBalance: response?.totalPreviousBalance,
        ticketRemainingAmount: response?.ticketRemainingAmount,
      }))
      console.log("client balance", response);

    } catch (error) {
      console.error("Error fetching confirmed bookings:", error);
    }
  };


  const closeModal = () => {
    setShowModal(false);
    setPaymentType("");
    setFormData({
      totalRemainingBalance: "",
      totalAmount: "",
      receivingDate: "",
      paymentAmount: 0,

      bankName: "",
      transactionId: "",
      transactionDate: "",

      cardNumber: "",
      cardType: "",
      cardHolderName: "",
      cardTransactionDate: "",

      upiId: "",
      upiTransactionId: "",
      upiTransactionDate: "",

      chequeNumber: "",
      chequeBankName: "",
      chequeTransactionDate: "",
    });
  };

  const handleSubmit = async () => {
    if (!selectedBooking) {
      // alert("No Booking Selected");
       Swal.fire({
          position: "center",
          icon: "success",
          title: "No Booking Selected",
          showConfirmButton: false,
          timer: 1500
        });
      return;
    }
    let type = "flight";
    const bookingType = selectedBooking.type;
    if (bookingType === "Bus") {
      type = "bus"
    }
    else if (bookingType === "Rail") {
      type = "rail"
    }
    else {
      type = "flight"
    }
    try {
      const payload = {
        ...formData,
        paymentType,
        bookingId: selectedBooking.bookingId,
        amount: selectedBooking.amount,
        bookingType: type,
      };

      console.log(selectedBooking, "cacxbhcsdhigcds");



      const response = await postData(

        "/api/payments/collect",
        payload
      );


      if (response.success) {

         Swal.fire({
          position: "center",
          icon: "success",
          title: "Payment Submitted Successfully ",
          showConfirmButton: false,
          timer: 1500
        });
        closeModal();
      } else {
        
         Swal.fire({
          position: "center",
          icon: "success",
          title: "Payment Failed ",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error("Payment Submit Error:", error);
     
       Swal.fire({
          position: "center",
          icon: "success",
          title: "Something went wrong!",
          showConfirmButton: false,
          timer: 1500
        });
    }
  };


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if(role=="admin"){
           const response = await getData("/api/confirmed");
        if (response.success) setBookings(response.bookings);
        }
        else{
          const response = await getData("/api/confirmed");
            if (response.success) setBookings(response.bookings);
        }
       
      } catch (error) {
        console.error("Error fetching confirmed bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  const handleCancel = (booking) => {
    navigate(`/${roll}/cancel-from/${booking?.type}/${booking?.bookingId}`);
  };

  const filtered = bookings
    .filter((item) => {
      if (filterType === "all") return true;
      return item.type?.toLowerCase() === filterType.toLowerCase();
    })
    .filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const handleSort = (column) => {
    if (column === sortColumn)
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData = [...filtered].sort((a, b) => {
    if (!sortColumn) return 0;

    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (!valA || !valB) return 0;

    if (
      sortColumn === "bookingDate" ||
      sortColumn === "travelDate"
    ) {
      valA = new Date(valA);
      valB = new Date(valB);
    }

    return sortOrder === "asc" ? (valA < valB ? -1 : 1) : valA > valB ? -1 : 1;
  });

  const indexLast = currentPage * rowsPerPage;
  const indexFirst = indexLast - rowsPerPage;
  const currentRows = sortedData.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-semibold mb-4">
        Confirmed Bookings ({sortedData.length})
      </h2>

     
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded-md w-64"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="border px-3 py-1 rounded-md"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="bus">Bus</option>
          <option value="Rail">Train</option>
          <option value="flight">Flight</option>
        </select>
      </div>

      
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {[
              { key: "bookingId", label: "ID" },
              { key: "clientName", label: "Client Name" },
              { key: "pnrNumber", label: "PNR" },
              { key: "status", label: "Status" },
              { key: "type", label: "Type" },
              { key: "route", label: "Route" },
              { key: "amount", label: "Amount" },
              { key: "bookingDate", label: "Booking Date" },
              { key: "updatedBy", label: "Booking By" },
              // { key: "travelDate", label: "Travel Date" },
            ].map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="px-4 py-2 cursor-pointer"
              >
                <div className="flex justify-center items-center">
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

            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((b, index) => (
              <tr key={index} className="border-t text-center">
                <td>{b.bookingId}</td>
                <td>{b.clientName}</td>
                <td>{b.pnrNumber}</td>
                <td>{b.ticketStatus}</td>
                <td>{b.type}</td>
                <td>{b.route}</td>
                <td>₹{b.amount}</td>
                <td>{b.bookingDate.split("T")[0]}</td>
                <td>{b.updatedBy}</td>
                

                <td className="flex justify-center gap-2 py-2">
                  <button
                    onClick={() => openModal(b)}
                    className="bg-blue-600 text-white p-2 rounded-lg"
                  >
                    <FaWallet />
                  </button>

                  <button
                    onClick={() => handleCancel(b)}
                    className="bg-red-600 text-white p-2 rounded-lg"
                  >
                    <FaTimes />
                  </button>

                  <button
                    onClick={() => handleCancel(b)}
                    className="bg-green-600 text-white p-2 rounded-lg"
                  >
                    <FaDownload />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center py-4">
                No Records Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

     
      <div className="mt-4 flex justify-between items-center">
        <p>
          Showing {indexFirst + 1} to {Math.min(indexLast, sortedData.length)} of{" "}
          {sortedData.length}
        </p>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/500 bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

            
       

             <div>
              <label className="font-medium"> Total  Remaining Balance (Without GST)</label>
            </div>
            <input
              type="number"    
              disabled="true"
              placeholder="Total Remaining Balance"
              className="w-full border p-2 rounded mb-2"
              value={formData.totalRemainingBalance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalRemainingBalance: e.target.value,
                })
              }
            />
            <div>
              <label className="font-medium"> TicketRemainingAmount Amount </label>
            </div>
            <p 
              className="w-full border p-2 rounded mb-2"
            >{formData.ticketRemainingAmount}</p>
          

           
            <div>
              <label className="font-medium"> TicketTotalAmount(Without GST) </label>
            </div>
            <p
              className="w-full border p-2 rounded mb-2"
            >{formData.totalAmount}</p>
        
            <div>
              <label className="font-medium"> Payment Date </label>
            </div>
            <input
              type="date"
              label="Payment Date"
              className="w-full border p-2 rounded mb-2"
              value={formData.receivingDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  receivingDate: e.target.value,
                })
              }
            />

            <select
              className="w-full border p-2 rounded mb-2"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="">Select Payment Type</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
               <option value="Cash">Cash</option>
            </select>

            {paymentType === "bank" && (
              <>
                <input
                  type="text"
                  placeholder="Bank Name"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
  }}
                />

                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionId: e.target.value })
                  }
                />

                <input
                  type="date"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.transactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionDate: e.target.value,
                    })
                  }
                />
              </>
            )}

            {paymentType === "card" && (
              <>
                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }}
                />

                <input
                  type="text"
                  placeholder="Card Type (VISA/Master)"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.cardType}
                  onChange={(e) =>
                    setFormData({ ...formData, cardType: e.target.value })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
  }}
                />

                <input
                  type="text"
                  placeholder="Card Holder Name"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.cardHolderName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cardHolderName: e.target.value,
                    })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
  }}
                />

                <input
                  type="date"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.cardTransactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cardTransactionDate: e.target.value,
                    })
                  }
                />
              </>
            )}

            {paymentType === "upi" && (
              <>
                <input
                  type="text"
                  placeholder="UPI ID"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.upiId}
                  onChange={(e) =>
                    setFormData({ ...formData, upiId: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.upiTransactionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      upiTransactionId: e.target.value,
                    })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }}
                />

                <input
                  type="date"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.upiTransactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      upiTransactionDate: e.target.value,
                    })
                  }
                />
              </>
            )}

            {paymentType === "cheque" && (
              <>
                <input
                  type="text"
                  placeholder="Cheque Number"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.chequeNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, chequeNumber: e.target.value })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }}
                />

                <input
                  type="text"
                  placeholder="Bank Name"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.chequeBankName}
                  onChange={(e) =>
                    setFormData({ ...formData, chequeBankName: e.target.value })
                  }
                   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
  }}
                />

                <input
                  type="date"
                  className="w-full border p-2 rounded mb-2"
                  value={formData.chequeTransactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chequeTransactionDate: e.target.value,
                    })
                  }
                />
              </>
            )}


             {paymentType === "Cash" && (
              <>
    
               
              </>
            )}

            <input
              type="text"
              placeholder="Payment Amount"
              className="w-full border p-2 rounded mb-2"
              value={formData.paymentAmount}

              onChange={(e) =>
                setFormData({ ...formData, paymentAmount: Number(e.target.value) })
              }
              onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }} inputmode="numeric"
            />

            <div className="flex justify-between mt-3">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmedBookings;
