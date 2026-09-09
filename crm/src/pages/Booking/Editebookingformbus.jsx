import React, { useEffect, useState } from "react";
import Demo from "./Demo";
import { getData, putData } from '../../services/apiService';
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { CalendarDays } from "lucide-react";

export default function Editebookingformbus() {

  const {  id } = useParams();  
  const type="bus"
  const navigate = useNavigate();
const role=sessionStorage.getItem("role")
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    ticketNumber: "",
    busOperator: "",
    from: "",
    to: "",
    boardingPoint:"",
    journeyDate: "",
    busType: "",
    seatType: "",
    seatNumbers: "",
    passengers: 1,
    remarks: "",
    amount: 0,
  });

  const [passengerDetails, setPassengerDetails] = useState([
    {honorifics:"", name: "", age: "", gender: "" },
  ]);

  const agentid = sessionStorage.getItem("agentID");
    const [bookingType, setBookingType] = useState("single")
     const [errors, setErrors] = useState({});
 const [multipleTripDetails, setMultipleTripDetails] = useState([])
  const [roundTrip, setRoundTrip] = useState({ from: "", to: "", boardingPoint: "", departureDate: "", busType: "", seatType: "", seatNumbers: "" })
 
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getData(`/api/updateBooking/${type}/${id}`);
        console.log("GET booking data:", res);
        const tripType = res.booking.tripType
          const tripDetails = res.bookingTripDetails[0]
        setBookingType(tripType)
        if(tripType=="round"){
          setRoundTrip({
            ...tripDetails,
            from:tripDetails.fromLocation,
            to:tripDetails.toLocation,
            bording:tripDetails.boardingPoint,
            seatNumbers:tripDetails.seatNumber,
            departureDate:tripDetails.journeyDate.split("T")[0],
            seatType:tripDetails.seatType,
            busType:tripDetails.busType
          })
        }else if(tripType=="multi"){
        const tripDetails = res.bookingTripDetails
          setMultipleTripDetails(tripDetails.map(item=>({ from: item.fromLocation, to: item.toLocation, boardingPoint: item.boardingPoint, departureDate: item.journeyDate.split("T")[0], busType: item.busType, seatType: item.seatType, seatNumbers:item.seatNumber})))
        }
        if (res?.booking) {
          setFormData({
            clientName: res?.booking.client?.name || "",
            email: res?.booking.client?.email || "",
            phone: res?.booking.client?.phone || "",
            remarks: res?.booking.client?.note || "",
            ticketNumber: res.booking?.busNumber || "",
            busOperator: res.booking?.companyType || "",
            from: res.booking?.fromStop || "",
            to: res.booking?.toStop || "",
            boardingPoint:res.booking?.boardingPoint || "",
            journeyDate: res.booking?.departureDateTime?.split("T")[0] || "",
            busType: res.booking?.busType || "",
            seatType: res.booking?.seatType || "",
            seatNumbers: res.booking?.seatNumber || "",
            passengers: res.booking?.busPassengers?.length || 1,
            amount: res.booking?.fare || 0,
          });

          setPassengerDetails(
            res.booking?.busPassengers || [{ name: "", age: "", gender: "" }]
          );
        }

      } catch (error) {
        console.error("GET API ERROR:", error);
      }
    };

    fetchBooking();
  }, [type, id]);

   const handleChange = (e) => {
   const { name, value, type, checked } = e.target;
    if (name == "from") {
      setRoundTrip((prev) => ({ ...prev, to: value }))
    } else if (name == "to") {
      setRoundTrip((prev) => ({ ...prev, from: value }))
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

  };


  
  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value);
    setFormData({ ...formData, passengers: count });

    const updated = Array.from(
      { length: count },
      (_, i) => passengerDetails[i] || { name: "", age: "", gender: "" }
    );
    setPassengerDetails(updated);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  function hanleAddNew() {
    setMultipleTripDetails([...multipleTripDetails, { from: "", to: "", boardingPoint: "", departureDate: "", busType: "", seatType: "", seatNumbers: "" }])
  }
  function handleDelete(index) {
    if (multipleTripDetails.length > 1)
      setMultipleTripDetails(prev => prev.filter((_, i) => i !== index))
  }
  function hanldeMutipleTripChange(index, e) {
    setMultipleTripDetails(prev => {
      const updated = [...prev];
      updated[index][e.target.name] = e.target.value;
      return updated;
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone) {
      Swal.fire({ icon: "error", title: "Phone Missing" });
      return;
    }

    const obj = {
      type: "bus",
      createdBy: agentid ? agentid : 1,
      client: {
        name: formData.clientName,
        phone: formData.phone,
        email: formData.email,
        note: formData.remarks,
      },
      booking: {
        busNumber: formData.ticketNumber,
        seatType: formData.seatType,
        fromStop: formData.from,
        toStop: formData.to,
        boardingPoint:formData.boardingPoint,
        departureDateTime: formData.journeyDate,
        companyType: formData.busOperator,
        seatNumber: formData.seatNumbers,
        busType: formData.busType,
        passengers: passengerDetails,
        fare: formData.amount,
      },
      tripType: bookingType,
      roundTrip: roundTrip,
      multipleTripDetails: multipleTripDetails
    };
      console.log(passengerDetails);
      
    try {
      let a=""
      if(role==="admin")
      {
        a="/api/bookings/"+type+"/" +id
      }
      else{
        a="/api/bookings/agent/"+agentid+"/"+type+"/"+id
      }
      const result = await putData(a, obj);

      Swal.fire({
        icon: "success",
        title: "Bus Booking Updated Successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(-1);

    } catch (error) {
      console.error("POST ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
      });
    }
  };

  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-1 text-gray-800">Bus Booking</h2>
        <p className="text-sm text-gray-500 mb-6">Update bus booking details</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Client Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Client Name *</label>
                <Demo formData={formData} setFormData={setFormData} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-2 w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-2 w-full" required />
              </div>

              <div>
                <label className="text-sm text-gray-600">Remarks</label>
                <textarea name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="border rounded-lg px-4 py-2 w-full h-20"></textarea>
              </div>
            </div>
          </div>

       
       

          <div>
            <h3 className="font-medium text-gray-700 mb-3">Bus Information</h3>
            <div>
              <label className="block text-sm mb-1">Booking Type *</label>
              <div className="flex items-center space-x-4 mb-4">
                <div><input type="radio" checked={bookingType=="single"} name="booking-type" defaultChecked onChange={() => setBookingType("single")} id="single" />
                  <label htmlFor="single">Single</label>
                </div>
                <div><input type="radio" checked={bookingType=="round"} name="booking-type" onChange={() => setBookingType("round")} id="round" />
                  <label htmlFor="round">Round Tripe</label>
                </div>
                <div><input type="radio" checked={bookingType=="multi"} name="booking-type" onChange={() => { setBookingType("multi"); hanleAddNew() }} id="multiple" />
                  <label htmlFor="multiple">Multiple Trip</label>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From *</label>
                <input type="text" name="from" value={formData.from} placeholder="Departure city" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">To *</label>
                <input type="text" name="to" value={formData.to} placeholder="Arrival city" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bording *</label>
                <input type="text" value={formData.boardingPoint} name="boardingPoint" placeholder="Bording city" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Journey Date *</label>
                <input type="date" name="journeyDate" value={formData.journeyDate} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bus Type</label>
                <select name="busType" onChange={handleChange} value={formData.busType} className="border rounded-lg px-4 py-2 w-full">
                  <option value="">Select bus type</option>
                  <option value="AC">AC</option>
                  <option value="AC-Sleeper">AC Sleeper</option>
                  <option value="Non-AC">Non AC</option>
                  <option value="Sleeper">Sleeper</option>
                  <option value="Seater">Seater</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Seat Type</label>
                <select name="seatType" value={formData.seatType} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full">
                  <option value="">Select seat type</option>
                  <option value="Window">Window</option>
                  <option value="Middle">Middle</option>
                  <option value="upper">upper</option>
                  <option value="Lower">Lower</option>
                  <option value="Aisle">Aisle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Seat Numbers</label>
                <input type="text" value={formData.seatNumbers} name="seatNumbers" placeholder="e.g., A1, A2, B3" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
              </div>
            </div>

            {bookingType === "round" && (
              <div>
                <h3>Return Journey Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                  <div>
                    <label className="block text-sm mb-1">From *</label>
                    <input
                      type="text"
                      name="from"
                      value={roundTrip.from}
                      disabled
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Departure city"
                    />
                    {errors.from && <p className="text-red-500 text-sm">{errors.from}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">To *</label>
                    <input
                      type="text"
                      disabled
                      name="to"
                      value={roundTrip.to}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Arrival city"
                    />
                    {errors.to && <p className="text-red-500 text-sm">{errors.to}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Bording *</label>
                    <input
                      type="text"
                      name="boardingPoint"
                      value={roundTrip.boardingPoint}
                      onChange={({ target }) => setRoundTrip((prev) => ({ ...prev, boardingPoint: target.value }))}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Bording city"
                    />
                    {errors.to && <p className="text-red-500 text-sm">{errors.to}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Return Date *</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="date"
                        name="departureDate"
                        value={roundTrip.departureDate}
                        onChange={({ target }) => setRoundTrip((prev) => ({ ...prev, departureDate: target.value }))}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      />
                    </div>
                    {errors.journeyDate && (
                      <p className="text-red-500 text-sm">{errors.journeyDate}</p>
                    )}
                  </div>


                  

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bus Type</label>
                    <select name="busType"
                    value={roundTrip.busType}
                      onChange={({ target }) => setRoundTrip((prev) => ({ ...prev, busType: target.value }))}
                      className="border rounded-lg px-4 py-2 w-full">
                      <option value="">Select bus type</option>
                      <option value="AC">AC</option>
                      <option value="AC-Sleeper">AC Sleeper</option>
                      <option value="Non-AC">Non AC</option>
                      <option value="Sleeper">Sleeper</option>
                      <option value="Seater">Seater</option>
                    </select>
                    {errors.busType && <p className="text-red-500 text-sm">{errors.busType}</p>}
                  </div>

                 
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Seat Type</label>
                    <select name="seatType"
                    value={roundTrip.seatType}
                      onChange={({ target }) => setRoundTrip((prev) => ({ ...prev, seatType: target.value }))}
                      className="border rounded-lg px-4 py-2 w-full">
                      <option value="">Select seat type</option>
                      <option value="Window">Window</option>
                      <option value="Middle">Middle</option>
                      <option value="upper">upper</option>
                      <option value="Lower">Lower</option>
                      <option value="Aisle">Aisle</option>
                    </select>
                    {errors.seatType && <p className="text-red-500 text-sm">{errors.seatType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Seat Numbers</label>
                    <input type="text" name="seatNumbers" value={roundTrip.seatNumbers} placeholder="e.g., A1, A2, B3"
                      onChange={({ target }) => setRoundTrip((prev) => ({ ...prev, seatNumbers: target.value }))}
                      className="border rounded-lg px-4 py-2 w-full" />
                  </div>
                </div>
              </div>
            )}

            {bookingType === "multi" && (
              <div>
                {multipleTripDetails.map((item, index) => (
                  <div className="grid rounded-xl mt-3 grid-cols-1 md:grid-cols-2 gap-4">
                    <h3>Multiple Journey Details {index + 2}</h3>

                    <div className="flex justify-end">
                      <button className="bg-red-500 text-white px-4 py-2 rounded-xl" type="button" onClick={() => handleDelete(index)}>Remove</button>
                    </div>

                
                    <div>
                      <label className="block text-sm mb-1">From *</label>
                      <input
                        type="text"
                        name="from"
                        value={item.from}

                        onChange={(event) => hanldeMutipleTripChange(index, event)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Departure city"
                      />
                      {errors.from && <p className="text-red-500 text-sm">{errors.from}</p>}
                    </div>

                    <div>
                      <label className="block text-sm mb-1">To *</label>
                      <input
                        type="text"

                        name="to"
                        value={item.to}
                        onChange={(event) => hanldeMutipleTripChange(index, event)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Arrival city"
                      />
                      {errors.to && <p className="text-red-500 text-sm">{errors.to}</p>}
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Bording *</label>
                      <input
                        type="text"
                        name="boardingPoint"
                        value={item.boardingPoint}
                        onChange={(event) => hanldeMutipleTripChange(index, event)}
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Bording city"
                      />
                      {errors.to && <p className="text-red-500 text-sm">{errors.to}</p>}
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Return Date *</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="date"
                          name="departureDate"
                          value={item.departureDate}
                          onChange={(event) => hanldeMutipleTripChange(index, event)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                      </div>
                      {errors.journeyDate && (
                        <p className="text-red-500 text-sm">{errors.journeyDate}</p>
                      )}
                    </div>




             

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Bus Type</label>
                      <select name="busType" value={item.busType} onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full">
                        <option value="">Select bus type</option>
                        <option value="AC">AC</option>
                        <option value="AC-Sleeper">AC Sleeper</option>
                        <option value="Non-AC">Non AC</option>
                        <option value="Sleeper">Sleeper</option>
                        <option value="Seater">Seater</option>
                      </select>
                      {errors.busType && <p className="text-red-500 text-sm">{errors.busType}</p>}
                    </div>

                  
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Seat Type</label>
                      <select value={item.seatType} name="seatType" onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full">
                        <option value="">Select seat type</option>
                        <option value="Window">Window</option>
                        <option value="Middle">Middle</option>
                        <option value="upper">upper</option>
                        <option value="Lower">Lower</option>
                        <option value="Aisle">Aisle</option>
                      </select>
                      {errors.seatType && <p className="text-red-500 text-sm">{errors.seatType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Seat Numbers</label>
                      <input type="text" value={item.seatNumbers} name="seatNumbers" placeholder="e.g., A1, A2, B3" onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full" />
                    </div>

                  </div>
                ))}
                <button className="bg-black px-5 py-2 rounded-xl text-white mt-2 font-semibold" type="button" onClick={() => hanleAddNew()}> + Add New Journey Details</button>

              </div>
            )}
          </div>

    
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Passenger Details</h3>

            <div className="flex gap-4 mb-4">
              <label className="text-gray-700">Passengers:</label>

              <input type="number" min="1"
                value={formData.passengers}
                onChange={handlePassengerCountChange}
                className="border px-3 py-2 rounded-lg w-24" />
            </div>

            {passengerDetails.map((p, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg mb-3">

                 <div>
                  <label>honorifics</label>
                  <select value={p.honorifics}
                    onChange={(e) => handlePassengerChange(i, "honorifics", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full">
                    <option value="">honorifics</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Master">Master</option>
                <option value="Miss">Miss</option>
                <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label>Name</label>
                  <input value={p.name}
                    onChange={(e) => handlePassengerChange(i, "name", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full" />
                </div>

                <div>
                  <label>Age</label>
                  <input type="number" value={p.age}
                    onChange={(e) => handlePassengerChange(i, "age", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full" />
                </div>

                <div>
                  <label>Gender</label>
                  <select value={p.gender}
                    onChange={(e) => handlePassengerChange(i, "gender", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

              </div>
            ))}

          </div>

       
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">

          

            <div className="flex justify-end gap-3 mt-6 md:mt-0">
              <button type="button" className="px-4 py-2 border rounded-lg"
                onClick={() => navigate(-1)}>
                Cancel
              </button>

              <button type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Update Booking
              </button>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
