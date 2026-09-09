


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getData, postData, postDatawithFile } from "../../services/apiService";
import PaymentForm from "./PaymentForm";
import Swal from "sweetalert2";
const EditFlightBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const type = "flight";
  const [loading, setLoading] = useState(true);
  const [numPassengers, setNumPassengers] = useState(1);
  const [file, setFile] = useState(null);
  const role = sessionStorage.getItem("role")
  const agentid = sessionStorage.getItem("agentID")
  console.log(agentid, "aggent idddddddddddddddd");
  const [paymentdata, setpaymentdata] = useState({
    // pnrNumber: "",
    // ticketNumber: "",
    uploadTicket: "",
    previousBalance: "",
    amount: 0,
    // ticketType: "",
    serviceCharge: "",
    totalAmount: 0,
    dateOfReceiving: "",
    // paymentMode: "",
    // paymentAmount: 0,
    // remainingBalance: "",
    // // ticketStatus :"",
    // remarks: "",
  });
  const [multipleTripDetails, setMultipleTripDetails] = useState([])

  const [bookingType, setBookingType] = useState("single")
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    from: "",
    to: "",
    boardingPoint: "",
    journeyDate: "",
    returnDate: "",
    airline: "",
    travelClass: "",

    passengers: [{ name: "", age: "", gender: "" }],
    pnrNumber: "",
    ticketStatus: "",
    ticketNumber: "",
    previousBalance: 0,
    amount: 0,
    ticketType: "",
    serviceCharge: 0,
    totalAmount: 0,
    dateOfReceiving: "",
    paymentMode: "",
    paymentAmount: 0,
    remainingBalance: 0,
    Bookingcharge: "",
    remarks: "",
  });


  useEffect(() => {


    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await getData(`/api/updateBooking/${type}/${id}`);


        if (res && res) {
          console.log("reee", res);

          const booking = res?.booking;
          console.log(booking);
          setBookingType(booking.tripType)
          if (booking.tripType !== "single") {
            const tripDetails = res.bookingTripDetails
            setMultipleTripDetails(tripDetails.map(item => ({ from: item.fromLocation, to: item.toLocation, boardingPoint: item.boardingPoint, departureDate: item.journeyDate.split("T")[0], airline: item.airline, flightClass: item.travelClass })))
          }
          setFormData({
            clientName: booking?.client?.name || "",
            email: booking.client?.email || "",
            phone: booking.client.phone || "",
            from: booking.fromAirport || "",
            to: booking.toAirport || "",
            boardingPoint: booking.boardingPoint || "",
            journeyDate: booking.departureDateTime || "",
            returnDate: booking.returnDate || "",
            airline: booking.flightNumber || "",
            travelClass: booking.travelClass || "",

            passengers: booking.flightPassengers?.length
              ? booking.flightPassengers
              : [{ name: "", age: "", gender: "" }],

          });


          setNumPassengers(
            booking.passengers?.length ? booking.passengers.length : 1
          );
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        // alert("Failed to load booking details.");
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Failed to load booking details. ",
          showConfirmButton: false,
          timer: 1500
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      passengers: updatedPassengers,
    }));
  };

  const handlePassengerCountChange = (count) => {
    const num = Math.max(1, Math.min(count, 10));
    setNumPassengers(num);
    const updated = [...formData.passengers];
    if (num > updated.length) {
      for (let i = updated.length; i < num; i++) {
        updated.push({ name: "", age: "", gender: "" });
      }
    } else {
      updated.length = num;
    }
    setFormData((prev) => ({ ...prev, passengers: updated }));
  };


  const handleFileChange = (e) => {
    setpaymentdata((prev => ({ ...prev, uploadTicket: e.target.files[0] })))
  };


  const handleSubmit = async () => {
    try {
      const dataToSend = new FormData();
      console.log("total data", formData, paymentdata);

      Object.keys(formData).forEach((key) => {
        if (key === "passengers") {
          dataToSend.append("passengers", JSON.stringify(formData.passengers));
        } else {
          dataToSend.append(key, formData[key]);
        }
      });
      console.log(paymentdata);

      Object.keys(paymentdata).forEach((key) => {
        console.log(paymentdata.ticketStatus);

        dataToSend.append(key, paymentdata[key]);
      });
      const res = await postDatawithFile(`/api/updateBooking/${type}/${id}`, dataToSend);

      if (res.success) {
        // alert("Booking updated successfully!");
        // navigate(-1);
        Swal.fire({
          position: "center",
          icon: "success",
          title: " Booking Updated Successfully! ",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate(-1);
        });
      } else {
        // alert(res.message || "Failed to update booking.");
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Update failed! ",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      // alert("Something went wrong while updating.");
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Something went wrong while updating. failed! ",
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading booking details...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold mb-2">
        Update Flight Booking Details - {id}
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Edit flight booking, passenger, and payment details.
      </p>


      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">
          Booking Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Client Name *</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">
          Flight Information
        </h3>
        <h4>Booking Type: <span className="capitalize">{bookingType == "multi" ? "Multiple" : bookingType}</span></h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">From *</label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              placeholder="Departure city"
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To *</label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              placeholder="Arrival city"
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bording *</label>
            <input
              type="text"
              name="boardingPoint"
              value={formData.to}
              onChange={handleChange}
              placeholder="Bording city"
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Departure Date *</label>
            <input
              type="date"
              name="journeyDate"
              value={formData.journeyDate}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

        </div>
        {bookingType !== "single" &&
          multipleTripDetails.map((item, idx) => (
            <div>
              <h3 className="mt-4">Booking Information: {idx + 2}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">From *</label>
                  <input
                    type="text"
                    name="from"
                    disabled
                    value={item.from}
                    onChange={handleChange}
                    placeholder="Departure city"
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">To *</label>
                  <input
                    type="text"
                    name="to"
                    disabled
                    value={item.to}
                    onChange={handleChange}
                    placeholder="Arrival city"
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bording *</label>
                  <input
                    type="text"
                    name="boardingPoint"
                    value={item.boardingPoint}
                    disabled
                    onChange={handleChange}
                    placeholder="Bording city"
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Departure Date *</label>
                  <input
                    type="date"
                    name="journeyDate"
                    disabled
                    value={item.departureDate}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

              </div>
            </div>
          ))


        }
      </section>


      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">
          Passenger Details
        </h3>
        <div className="mb-4">
          <label className="text-sm font-medium mr-2">
            Number of Passengers:
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.passengers?.length}
            onChange={(e) =>
              handlePassengerCountChange(parseInt(e.target.value) || 1)
            }
            className="w-20 border rounded-md px-2 py-1"
          />
        </div>
        {formData.passengers.map((p, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-b pb-4"
          >
            <div>
              <label className="text-sm font-medium">Passenger {i + 1} Name</label>
              <input
                type="text"
                value={p.name}
                onChange={(e) =>
                  handlePassengerChange(i, "name", e.target.value)
                }
                placeholder="Enter name"
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Age</label>
              <input
                type="number"
                value={p.age}
                onChange={(e) => handlePassengerChange(i, "age", e.target.value)}
                placeholder="Age"
                className="w-full border rounded-md px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Gender  </label>
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
      </section>


      <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">
          Booking Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">PNR Number *</label>
            <input
              type="text"
              name="pnrNumber"
              value={formData.pnrNumber}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Register No </label>
            <input
              type="text"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Upload Ticket
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.ticketStatus}
              onChange={({ target }) => setFormData((prev) => ({ ...prev, ticketStatus: target.value }))}
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



      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-gray-800"
        >
          Update Booking
        </button>
      </div>
    </div>
  );
};

export default EditFlightBookingDetails;
