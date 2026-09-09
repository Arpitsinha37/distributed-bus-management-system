




import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import Demo from "./Demo";
import { getData, putData } from "../../services/apiService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Editebookingformflite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const type = "flight";
 const role=sessionStorage.getItem("role")
 
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    from: "",
    to: "",
    boardingPoint:"",
    departureDate: "",
    returnDate: "",
    oneWay: false,
    airline: "",
    flightClass: "",
    passengers: 1,
    remarks: "",
    totalAmount: "",
  });

  const [passengerDetails, setPassengerDetails] = useState([
    {honorifics:"", name: "", age: "", gender: "" },
  ]);

  const [errors, setErrors] = useState({});
  const agentid = sessionStorage.getItem("agentID");

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await getData(`/api/updateBooking/${type}/${id}`);

      if (res?.success) {
        const booking = res.booking;
        const tripDetails = res.bookingTripDetails[0]
        setBookingType(booking.tripType)
        if(booking.tripType=="round"){
          Setroundtrip({
            ...tripDetails,
            from:tripDetails.fromLocation,
            to:tripDetails.toLocation,
            bording:tripDetails.boardingPoint,
            flightClass:tripDetails.travelClass,
            departureDate:tripDetails.journeyDate.split("T")[0]
          })
        }else if(booking.tripType=="multi"){
        const tripDetails = res.bookingTripDetails
          setMultipleTripDetails(tripDetails.map(item=>({ from: item.fromLocation, to: item.toLocation, boardingPoint: item.boardingPoint, departureDate: item.journeyDate.split("T")[0], airline: item.airline, flightClass: item.travelClass })))
        }
        setFormData({
          clientName: booking.client.name,
          email: booking.client.email,
          phone: booking.client.phone,
          from: booking.fromAirport,
          to: booking.toAirport,
          boardingPoint:booking.boardingPoint,
          departureDate: booking.departureDateTime,
          returnDate: booking.returnDateTime || "",
          oneWay: booking.oneWay,
          airline: booking.flightNumber,
          flightClass: booking.travelClass,
          passengers: booking.passengers?.length || 1,
          remarks: booking.remarks || "",
          totalAmount: booking.fare,
        });

        setPassengerDetails(booking.flightPassengers);
      }
    } catch (err) {
      console.log("Error fetching flight booking:", err);
    }
  };

     
       const [multipleTripDetails, setMultipleTripDetails] = useState([])
       const [roundtrip, Setroundtrip] = useState({
         from: "",
         to: "",
         airline: "",
         flightClass: "",
         departureDate: "",
         bording: "",
       })
     
       const [bookingType, setBookingType] = useState("single")
      //  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name == "from") {
      Setroundtrip((prev) => ({ ...prev, to: value }))
    } else if (name == "to") {
      Setroundtrip((prev) => ({ ...prev, from: value }))
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "passengers") {
      const count = parseInt(value);
      const updated = [...passengerDetails];
      while (updated.length < count)
        updated.push({ name: "", age: "", gender: "" });
      while (updated.length > count) updated.pop();
      setPassengerDetails(updated);
    }
  };

  const handlePassengerChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...passengerDetails];
    updated[index][name] = value;
    setPassengerDetails(updated);
  };

  
  const validate = () => {
    const newErrors = {};

    if (!formData.clientName.trim())
      newErrors.clientName = "Client name is required";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Enter valid 10-digit number";

    if (!formData.from.trim())
      newErrors.from = "Departure city is required";

    if (!formData.to.trim()) newErrors.to = "Arrival city is required";

    if (!formData.departureDate)
      newErrors.departureDate = "Departure date is required";

    if (!formData.oneWay && !formData.returnDate)
      newErrors.returnDate = "Return date required";

    if (!formData.airline) newErrors.airline = "Select airline";

    if (!formData.flightClass) newErrors.flightClass = "Select class";

    if (!formData.totalAmount) newErrors.totalAmount = "Enter amount";

    passengerDetails.forEach((p, i) => {
      if (!p.name.trim()) newErrors[`pname${i}`] = "Name required";
      if (!p.age.trim()) newErrors[`page${i}`] = "Age required";
      if (!p.gender) newErrors[`pgender${i}`] = "Gender required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   function hanleAddNew() {
    setMultipleTripDetails([...multipleTripDetails, { from: "", to: "", boardingPoint: "", departureDate: "", airline: "", flightClass: "" }])
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

   

    const obj = {
      type: "flight",
      updatedBy: agentid ? agentid : 1,
      client: {
        name: formData.clientName,
        phone: formData.phone,
        email: formData.email,
      },
      booking: {
        flightNumber: formData.airline,
        fromAirport: formData.from,
        toAirport: formData.to,
        boardingPoint:formData.boardingPoint,
        departureDateTime: formData.departureDate,
        returnDateTime: formData.returnDate,
        oneWay: formData.oneWay,
        travelClass: formData.flightClass,
        fare: formData.totalAmount,
        remarks: formData.remarks,
        passengers: passengerDetails,
      },
       tripType: bookingType,
        roundTrip: roundtrip,
        multipleTripDetails:multipleTripDetails
    };

    try {
      let a=""
        if(role==="admin")
        {
           a="/api/bookings/"+type+"/"+id
        }
        else{
          a="/api/bookings/agent/"+agentid+"/"+type+"/"+id
        }
      const res = await putData(a, obj);

      if (res?.success) {
       
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Flight Booking Updated Successfully! ",
          showConfirmButton: false,
          timer: 1500
        }).then(()=>{
          navigate(-1);
        });
      } else {
      
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Update failed! ",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Unexpected error!");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">
        Edit Flight Booking
      </h1>
      <p className="text-gray-500 mb-6">Modify and update flight booking</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">

        
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Booking Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm mb-1">Client Name *</label>
              <Demo formData={formData} setFormData={setFormData} />
              {errors.clientName && (
                <p className="text-red-500 text-sm">{errors.clientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="text-sm">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full h-20"
              ></textarea>
            </div>
          </div>
        </div>

    

 <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Flight Information</h2>
          <div>
            <label className="block text-sm mb-1">Booking Type *</label>
            <div className="flex items-center space-x-4 mb-4">
              <div><input type="radio" checked={bookingType=="single"} name="booking-type" defaultChecked onChange={() => setBookingType("single")} id="single" />
                <label htmlFor="single">Single</label>
              </div>
              <div><input type="radio" checked={bookingType=="round"} name="booking-type" onChange={() => setBookingType("round")} id="round" />
                <label htmlFor="round">Round Tripe</label>
              </div>
              <div><input type="radio" checked={bookingType=="multi"} name="booking-type" onChange={() => { setBookingType("multi"); hanleAddNew() }} id="multipleTripDetails" />
                <label htmlFor="multiple">Multiple Trip</label>
              </div>

            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">From *</label>
              <input
                type="text"
                name="from"
                value={formData.from}
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
                name="to"
                value={formData.to}
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
                value={formData.boardingPoint}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Bording city"
              />
              {errors.to && <p className="text-red-500 text-sm">{errors.to}</p>}
            </div>

            <div>
              <label className="block text-sm mb-1">Departure Date *</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
              {errors.departureDate && (
                <p className="text-red-500 text-sm">{errors.departureDate}</p>
              )}
            </div>


          


            <div>
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
            </div>

            <div>
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
            </div>

            <div>
              <label className="block text-sm mb-1">Number of Passengers *</label>
              <input
                type="number"
                name="passengers"
                min="1"
                value={formData.passengers}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1) {
                    handleChange(e);
                  } else {
                    setFormData({ ...formData, passengers: "" });
                  }
                }}
                className="w-full px-4 py-2 border rounded-lg"
              />
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
                    value={roundtrip.from}
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
                    value={roundtrip.to}
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
                    value={roundtrip.bording}
                    onChange={({ target }) => Setroundtrip((prev) => ({ ...prev, bording: target.value }))}
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
                      value={roundtrip.departureDate}
                      onChange={({ target }) => Setroundtrip((prev) => ({ ...prev, departureDate: target.value }))}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                  {errors.departureDate && (
                    <p className="text-red-500 text-sm">{errors.departureDate}</p>
                  )}
                </div>


          


                <div>
                  <label className="block text-sm mb-1">Airline *</label>
                  <input
                    type="text"
                    name="airline"
                    value={roundtrip.airline}
                    onChange={({ target }) => Setroundtrip((prev) => ({ ...prev, airline: target.value }))}

                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter Airline Name"
                  />
                  {errors.airline && <p className="text-red-500 text-sm">{errors.airline}</p>}
                </div>

                <div>
                  <label className="block text-sm mb-1">Class *</label>
                  <select
                    name="flightClass"
                    value={roundtrip.flightClass}
                    onChange={({ target }) => Setroundtrip((prev) => ({ ...prev, flightClass: target.value }))}

                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select class</option>
                    <option value="Economy">Economy</option>
                    <option value="Business">Business</option>
                  </select>
                  {errors.flightClass && <p className="text-red-500 text-sm">{errors.flightClass}</p>}
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
                    {errors.boardingPoint && <p className="text-red-500 text-sm">{errors.boardingPoint}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Jourenery Date *</label>
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
                    {errors.departureDate && (
                      <p className="text-red-500 text-sm">{errors.departureDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Airline *</label>
                    <input
                      type="text"
                      name="airline"
                      value={item.airline}
                      onChange={(event) => hanldeMutipleTripChange(index, event)}

                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Enter Airline Name"
                    />
                    {errors.airline && <p className="text-red-500 text-sm">{errors.airline}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Class *</label>
                    <select
                      name="flightClass"
                      value={item.flightClass}
                      onChange={(event) => hanldeMutipleTripChange(index, event)}

                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select class</option>
                      <option value="Economy">Economy</option>
                      <option value="Business">Business</option>
                    </select>
                    {errors.flightClass && <p className="text-red-500 text-sm">{errors.flightClass}</p>}
                  </div>
                </div>
              ))}
              <button className="bg-black px-5 py-2 rounded-xl text-white mt-2 font-semibold" type="button" onClick={() => hanleAddNew()}> + Add New Journey Details</button>

            </div>
          )}
        </div>
      
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Passenger Details</h2>
          {passengerDetails.map((p, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg"
            >

              
               <select
                name="honorifics"
                value={p.honorifics}
                onChange={(e) => handlePassengerChange(index, e)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">honorifics</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Master">Master</option>
                <option value="Miss">Miss</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                name="name"
                value={p.name}
                onChange={(e) => handlePassengerChange(index, e)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder={`Passenger ${index + 1} Name`}
              />

              <input
                type="number"
                name="age"
                value={p.age}
                onChange={(e) => handlePassengerChange(index, e)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Age"
              />

              <select
                name="gender"
                value={p.gender}
                onChange={(e) => handlePassengerChange(index, e)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          ))}
        </div>
          
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            Update Booking
          </button>
        </div>
      </form>
    </div>
  );
}
