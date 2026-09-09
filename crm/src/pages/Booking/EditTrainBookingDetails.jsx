


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getData, postData, postDatawithFile } from "../../services/apiService";
import PaymentForm from "./PaymentForm";
import Swal from "sweetalert2";

const EditTrainBookingDetails = () => {
  const { id: bookingId } = useParams();

  console.log("Booking ID:", bookingId);
  const navigate = useNavigate();
  const type = "rail";
  const [loading, setLoading] = useState(true);
  const [numPassengers, setNumPassengers] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "" }]);
  const [paymentdata, setpaymentdata] = useState({
    pnrNumber: "",
    // ticketNumber: "",
    uploadTicket: "",
    // previousBalance: 0,
    amount: 0,
    ticketType: "",
    serviceCharge: "",
    totalAmount: 0,
    dateOfReceiving: "",
    paymentMode: "",
    paymentAmount: 0,
    // remainingBalance: "",
    ticketStatus: "",
    remarks: "",
  });
  const [formData, setFormData] = useState({
    clientName: "",
    contactNumber: "",
    email: "",

    fromStation: "",
    toStation: "",
    boardingPoint:"",
    journeyDate: "",
    trainNumber: "",
    ticketNumber: "",
    amount: "",
    ticketType: "",
    Bookingcharge:"",

  });


  console.log(bookingId);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getData(`/api/updateBooking/${type}/${bookingId}`);
        if (res && res) {
          const data = res.booking;
          console.log(data);

          setFormData({
            clientName: data.client.name || "",
            contactNumber: data.client.phone || "",
            email: data.client.email || "",

            fromStation: data.fromStation || "",
            toStation: data.toStation || "",
            journeyDate: data.departureDate || "",
            boardingPoint: data.boardingPoint || "",
            trainNumber: data.trainNumber || "",
            status: data.status || "",

          });

          if (data.railPassengers && data.railPassengers.length > 0) {
            setPassengers(data.railPassengers);
            setNumPassengers(data.railPassengers.length);
          }
        }
      } catch (err) {
        console.error(err);
        // alert("Failed to fetch booking data.");
         Swal.fire({
          position: "center",
          icon: "error",
          title: " Failed to fetch booking data.",
          showConfirmButton: false,
          timer: 1500
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [type, bookingId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlepaymentdata = (field, value) => {

    console.log(field.target.name, "vae", field.target.value);
    if(field.target.name=="uploadTicket"){
      setpaymentdata({ ...paymentdata, [field.target.name]: field.target.files[0] });
      return
    }
    if (field.target.name == "amount") {
      console.log("check oue");

      setpaymentdata((prev) => ({
        ...prev,
        totalAmount: Number(field.target.value) + Number(paymentdata.serviceCharge),
        amount: field.target.value,

      }));
      return
    }

    if (field.target.name == "serviceCharge") {
      console.log("check oue");

      setpaymentdata((prev) => ({
        ...prev,
        totalAmount: Number(field.target.value) + Number(paymentdata.amount),
        serviceCharge: field.target.value,

      }));
      return
    }

    if (field.target.name == "paymentAmount") {


      setpaymentdata((prev) => ({
        ...prev,
        remainingBalance: Number(paymentdata.totalAmount) - Number(field.target.value),

        paymentAmount: field.target.value,

      }));
      return
    }


    setpaymentdata({ ...paymentdata, [field.target.name]: field.target.value });
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleNumChange = (e) => {
    const count = parseInt(e.target.value || 1);
    setNumPassengers(count);
    setPassengers(
      Array.from({ length: count }, (_, i) => passengers[i] || { name: "", age: "", gender: "" })
    );
  };

  const handleSubmit = async () => {
    try {
      
      const datasentToform = new FormData();
      Object.keys(formData).forEach((key) => {
        datasentToform.append(key, formData[key]);
      })
      Object.keys(paymentdata).forEach((key) => {
        datasentToform.append(key, paymentdata[key]);
      })


      const res = await postDatawithFile(`/api/updateBooking/${type}/${bookingId}`, datasentToform);

      // alert("Booking updated successfully!");
      // navigate(-1);
          Swal.fire({
          position: "center",
          icon: "success",
          title: " Booking Updated Successfully! ",
          showConfirmButton: false,
          timer: 1500
        }).then(()=>{
          navigate(-1);
        });
    } catch (error) {
      console.error(error);
      // alert("Failed to update booking.");
       Swal.fire({
          position: "center",
          icon: "success",
          title: "Update failed! ",
          showConfirmButton: false,
          timer: 1500
        });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-lg font-semibold text-gray-600">
        Loading booking details...
      </div>
    );
  }

  


  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Update Booking Details - {bookingId}
      </h2>


      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Number</label>
            <input
              type="text"
              value={formData.contactNumber}
              onChange={(e) => handleChange("contactNumber", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter email address"
            />
          </div>
      
        </div>
      </section>


      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Train Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Station</label>
            <input
              type="text"
              value={formData.fromStation}
              onChange={(e) => handleChange("fromStation", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Departure station"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Station</label>
            <input
              type="text"
              value={formData.toStation}
              onChange={(e) => handleChange("toStation", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Arrival station"
            />
          </div>

           <div>
            <label className="block text-sm font-medium mb-1">Bording Station</label>
            <input
              type="text"
              value={formData.toStation}
              onChange={(e) => handleChange("toStation", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Bording station"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Journey Date</label>
            <input
              type="date"
              value={formData.journeyDate}
              onChange={(e) => handleChange("journeyDate", e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Train Number</label>
            <input
              type="text"
              value={formData.trainNumber}
              onChange={(e) => handleChange("trainNumber", e.target.value)}
              className="w-full border rounded-md p-2"
              placeholder="Enter train number"
            />
          </div>
        </div>
      </section>


      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Passenger Details</h3>
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium">Number of Passengers:</label>
          <input
            type="number"
            value={numPassengers}
            onChange={handleNumChange}
            min="1"
            className="border p-2 w-20 rounded-md"
          />
        </div>

        <div className="space-y-4">
          {passengers.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md bg-gray-50"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Passenger {i + 1} Name
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  value={p.name}
                  onChange={(e) =>
                    handlePassengerChange(i, "name", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  value={p.age}
                  onChange={(e) =>
                    handlePassengerChange(i, "age", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  value={p.gender || ""}
                  onChange={(e) => handlePassengerChange(i, "gender", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>



      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-3 border-b pb-1">Booking Information</h3>         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">PNR Number *</label>
            <input type="text" onChange={handlepaymentdata} value={paymentdata.pnrNumber} name="pnrNumber" className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Register No</label>
            <input type="text" onChange={handlepaymentdata} value={paymentdata.ticketNumber} name="ticketNumber" className="w-full border rounded-md p-2" placeholder="Enter ticket number" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Upload Ticket (PDF/Image)</label>
            <input type="file" onChange={handlepaymentdata} name="uploadTicket" className="w-full border rounded-md p-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={paymentdata.ticketStatus}
              onChange={({ target }) => setpaymentdata((prev) => ({ ...prev, ticketStatus: target.value }))}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Waiting">Waiting</option>
            </select>
          </div>


        </div>
      </section>




      <PaymentForm formData={paymentdata} setFromData={setpaymentdata} />
  


      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 border rounded-md"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-indigo-700"
        >
          Update Booking
        </button>
      </div>
    </div>
  );
};

export default EditTrainBookingDetails;
