




import React, { useState ,useEffect } from "react";
import { CalendarDays } from "lucide-react"
import Demo from "./Demo";
import { getData, postData } from '../../services/apiService';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Demo1 from "./Demo1";
export default function BusBooking() {
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    ticketNumber: "",
    busOperator: "",
    from: "",
    to: "",
    boardingPoint: "",
    journeyDate: "",
    busType: "",
    seatType: "",
    seatNumbers: "",
    passengers: 1,
    boardingPoint: "",
    amount: 0,
    clientID:"",
  });
  const role = sessionStorage.getItem("role")
  console.log("role", role);
  const navigate = useNavigate()

  const [passengerDetails, setPassengerDetails] = useState([
    { honorifics: "", name: "", age: "", gender: "" },
  ]);
  const [bookingType, setBookingType] = useState("single")
  const [errors, setErrors] = useState({});
  const [multipleTripDetails, setMultipleTripDetails] = useState([])
  const [roundTrip, setRoundTrip] = useState({ from: "", to: "", boardingPoint: "", departureDate: "", busType: "", seatType: "", seatNumbers: "" })
  const agentid = sessionStorage.getItem("agentID");
   const [clientPassenger, setClientPassenger] = useState([])

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
    const updated = Array.from({ length: count }, (_, i) => passengerDetails[i] || { name: "", age: "", gender: "" });
    setPassengerDetails(updated);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  console.log("foror", formData);
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

 async function getClientPassengers() {
    try {
      const res = await getData("/api/passengers/clients/"+formData.clientID)
       setClientPassenger(res.passengers)
    } catch (error) {
      console.log(error);
      
      
    }
  }
  useEffect(()=>{
    console.log("geting passeng");
    
    if(formData.clientID){
      getClientPassengers()
    }
  },[formData.clientID])

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Bus Booking Submitted:", { formData, passengerDetails });


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
        boardingPoint: formData.boardingPoint,
        departureDateTime: formData.journeyDate,
        companyType: formData.busOperator,
        seatNumber: formData.seatNumbers || 55,
        busType: formData.busType,
        passengers: passengerDetails,
        fare: formData.amount,
      },
      tripType: bookingType,
      roundTrip: roundTrip,
      multipleTripDetails: multipleTripDetails
    }

    console.log(obj, " xyzabc");


    try {


      if (!formData.phone) {
        Swal.fire({
          title: 'Error!',
          text: 'Phone is missing',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
      let a = ""
      if (role === "admin") {
        a = '/api/booking'
      }
      else {
        a = "/api/booking/agent/" + agentid;
      }
      const res = await postData(a, obj)
      console.log("Server Response:", res);
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Successfully booking ",
        showConfirmButton: false,
        timer: 1500
      });
      navigate(-1)



    }
    catch (error) {
      console.error("Unexpected Error:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went to wrong',
        icon: 'error',
        confirmButtonText: 'OK'
      })
    }

  }



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-1 text-gray-800">Bus Booking</h2>
        <p className="text-sm text-gray-500 mb-6">Enter bus booking details</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <h3 className="font-medium text-gray-700 mb-3">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Client Name *</label>
                <Demo fromdata={formData} setFormData={setFormData} />
                {/* <input type="text" name="clientName" placeholder="Enter client name" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required /> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input type="email" name="email" placeholder="client@email.com" value={formData.email} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
                <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="text-sm text-gray-600">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter cancellation remarks..."
                  className="border rounded-lg px-4 py-2 w-full h-20"
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-3">Bus Information</h3>
            <div>
              <label className="block text-sm mb-1">Booking Type *</label>
              <div className="flex items-center space-x-4 mb-4">
                <div><input type="radio" name="booking-type" defaultChecked onChange={() => setBookingType("single")} id="single" />
                  <label htmlFor="single">Single</label>
                </div>
                <div><input type="radio" name="booking-type" onChange={() => setBookingType("round")} id="round" />
                  <label htmlFor="round">Round Tripe</label>
                </div>
                <div><input type="radio" name="booking-type" onChange={() => { setBookingType("multi"); hanleAddNew() }} id="multiple" />
                  <label htmlFor="multiple">Multiple Trip</label>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Ticket Number</label>
                <input type="text" name="ticketNumber" placeholder="Enter ticket number" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bus Operator</label>
                <input type="text" name="busOperator" placeholder="e.g., RedBus, VRL Travels" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From *</label>
                <input type="text" name="from" placeholder="Departure city" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">To *</label>
                <input type="text" name="to" placeholder="Arrival city" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bording *</label>
                <input type="text" name="boardingPoint" placeholder="Bording city" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Journey Date *</label>
                <input type="date" name="journeyDate" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bus Type</label>
                <select name="busType" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full">
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
                <select name="seatType" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full">
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
                <input type="text" name="seatNumbers" placeholder="e.g., A1, A2, B3" onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
              </div>
            </div>

            {bookingType === "round" && (
              <div>
                <h3>Return Journey Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bus Operator</label>
                    <input type="text" name="busOperator" placeholder="e.g., RedBus, VRL Travels" value={formData.busOperator} onChange={handleChange} className="border rounded-lg px-4 py-2 w-full" />
                  </div> */}
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


                  {/* <div>
            <label className="block text-sm mb-1">Airline *</label>
            <select
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select airline</option>
              <option value="IndiGo">IndiGo</option>
              <option value="Air India">Air India</option>
              <option value="SpiceJet">SpiceJet</option>
            </select>
            {errors.airline && <p className="text-red-500 text-sm">{errors.airline}</p>}
          </div> */}


                  {/* <div>
                  <label className="block text-sm mb-1">Airline *</label>
                  <input
                    type="text"
                    name="airline"
                    value={formData.airline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter Airline Name"
                  />
                  {errors.airline && <p className="text-red-500 text-sm">{errors.airline}</p>}
                </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bus Type</label>
                    <select name="busType"
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

                  {/* <div>
                  <label className="block text-sm mb-1">Class *</label>
                  <select
                    name="flightClass"
                    value={formData.flightClass}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select class</option>
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                  {errors.flightClass && <p className="text-red-500 text-sm">{errors.flightClass}</p>}
                </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Seat Type</label>
                    <select name="seatType"
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

                    {/* 
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Bus Operator</label>
                      <input type="text" name="busOperator" placeholder="e.g., RedBus, VRL Travels" value={formData.busOperator} onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full" />
                    </div> */}
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


                    {/* <div>
            <label className="block text-sm mb-1">Airline *</label>
            <select
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select airline</option>
              <option value="IndiGo">IndiGo</option>
              <option value="Air India">Air India</option>
              <option value="SpiceJet">SpiceJet</option>
            </select>
            {errors.airline && <p className="text-red-500 text-sm">{errors.airline}</p>}
          </div> */}


                    {/* <div>
                  <label className="block text-sm mb-1">Airline *</label>
                  <input
                    type="text"
                    name="airline"
                    value={formData.airline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter Airline Name"
                  />
                  {errors.airline && <p className="text-red-500 text-sm">{errors.airline}</p>}
                </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Bus Type</label>
                      <select name="busType" onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full">
                        <option value="">Select bus type</option>
                        <option value="AC">AC</option>
                        <option value="AC-Sleeper">AC Sleeper</option>
                        <option value="Non-AC">Non AC</option>
                        <option value="Sleeper">Sleeper</option>
                        <option value="Seater">Seater</option>
                      </select>
                      {errors.busType && <p className="text-red-500 text-sm">{errors.busType}</p>}
                    </div>

                    {/* <div>
                  <label className="block text-sm mb-1">Class *</label>
                  <select
                    name="flightClass"
                    value={formData.flightClass}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select class</option>
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                  {errors.flightClass && <p className="text-red-500 text-sm">{errors.flightClass}</p>}
                </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Seat Type</label>
                      <select name="seatType" onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full">
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
                      <input type="text" name="seatNumbers" placeholder="e.g., A1, A2, B3" onChange={(event) => hanldeMutipleTripChange(index, event)} className="border rounded-lg px-4 py-2 w-full" />
                    </div>

                  </div>
                ))}
                <button className="bg-black px-5 py-2 rounded-xl text-white mt-2 font-semibold" type="button" onClick={() => hanleAddNew()}> + Add New Journey Details</button>

              </div>
            )}
          </div>


          <div>
            <h3 className="font-medium text-gray-700 mb-3">Passenger Details</h3>
            <div className="flex items-center gap-4 mb-3">
              <label className="text-gray-600 font-medium">Number of Passengers:</label>
              <input
                type="number"
                min="1"
                name="passengers"
                value={formData.passengers}
                onChange={handlePassengerCountChange}
                className="border rounded-lg px-3 py-2 w-24"
              />
            </div>

            {passengerDetails.map((passenger, index) => (
              <div key={index}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 bg-gray-50 p-3 rounded-lg"
              >


                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">honorifics</label>
                  <select
                    value={passenger.honorifics}
                    onChange={(e) => handlePassengerChange(index, "honorifics", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full"
                  >
                    <option value="">honorifics</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Master">Master</option>
                    <option value="Miss">Miss</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Passenger {index + 1} Name
                  </label>
                 <Demo1 formData={passengerDetails} setFormData={setPassengerDetails} index={index} clientData={clientPassenger}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                  <input
                    type="number"
                    value={passenger.age}
                    placeholder="Age"
                    onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 items-center">

            <div className="flex w-full justify-end gap-3 mt-6 md:mt-0">
              <button
                type="button"
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Proceed to Confirmation
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
