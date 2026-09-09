


import React, { useState, useEffect } from "react";
import Demo from "./Demo";
import { getData, postData } from '../../services/apiService';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Demo1 from "./Demo1";
export default function TrainBooking() {
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    pnr: "",
    trainNumber: "",
    trainName: "",
    from: "",
    to: "",
    boardingPoint: "",
    journeyDate: "",
    classType: "",
    passengers: 1,
    amount: 0,
    clientID: "",
  });
  const role = sessionStorage.getItem("role")
  console.log("role", role);
  const navigate = useNavigate()

  const agentid = sessionStorage.getItem("agentID");
  const [passengerDetails, setPassengerDetails] = useState([
    { honorifics: "", name: "", age: "", gender: "" },
  ]);
  const [clientPassenger, setClientPassenger] = useState([])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
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
  async function getClientPassengers() {
    try {
      const res = await getData("/api/passengers/clients/" + formData.clientID)

      setClientPassenger(res.passengers)
    } catch (error) {
      console.log(error);


    }
  }
  useEffect(() => {
    console.log("geting passeng");

    if (formData.clientID) {
      getClientPassengers()
    }
  }, [formData.clientID])
  const handleSubmit = async (e) => {

    e.preventDefault();

    console.log("Train Booking Submitted:", { formData, passengerDetails });


    const obj = {
      type: "rail",
      createdBy: agentid ? agentid : 1,
      client: {
        name: formData.clientName,
        phone: formData.phone,
        email: formData.email,
      },

      booking: {
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        pnrNumber: formData.pnr,
        classType: formData.classType,
        fromStation: formData.from,
        toStation: formData.to,
        boardingPoint: formData.boardingPoint,
        departureDate: formData.journeyDate,
        fare: formData.amount,
        passengers: passengerDetails
      },

    };

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
      <h2 className="text-2xl font-semibold mb-1 text-gray-800">Train Booking</h2>
      <p className="text-sm text-gray-500 mb-6">Enter train booking details</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 space-y-6"
      >

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Client Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">Client Name</label>
              <Demo fromdata={formData} setFormData={setFormData} />
              {/* <input
                type="text"
                name="clientName"
                placeholder="Enter client name"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              /> */}
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                name="email"
                placeholder="client@email.com"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                name="phone"
                placeholder="+91 98765 43210"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
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
          <h3 className="font-medium text-gray-700 mb-3">Train Information</h3>
          <div className="grid grid-cols-2 gap-4">


            {/* <div>
              <label className="block text-gray-600 mb-1">Train Number</label>
              <input
                type="text"
                name="trainNumber"
                placeholder="Train Number"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div> */}

            <div>
              <label className="block text-gray-600 mb-1">Train Name</label>
              <input
                type="text"
                name="trainName"
                placeholder="Enter train name"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Class Type</label>
              <select
                name="classType"
                value={formData.classType}
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
              >
                <option value="">Select Class</option>
                <option value="AC1">AC1</option>
                <option value="AC2">AC2</option>
                <option value="AC3">AC3</option>
                <option value="3E">3E</option>
                <option value="2S">2S</option>
                <option value="EC">EC</option>
                <option value="EV">EV</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Business">Business</option>
                <option value="Economic">Economic</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1">From Station</label>
              <input
                type="text"
                name="from"
                placeholder="Departure station"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">To Station</label>
              <input
                type="text"
                name="to"
                placeholder="Arrival station"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Bording Station</label>
              <input
                type="text"
                name="boardingPoint"
                placeholder="Bording station"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>


            <div>
              <label className="block text-gray-600 mb-1">Journey Date</label>
              <input
                type="date"
                name="journeyDate"
                onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Passenger Details</h3>
          <div className="flex items-center gap-4 mb-3">
            <label className="text-gray-600">Number of Passengers:</label>
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
            <div
              key={index}
              className="grid grid-cols-3 gap-4 mb-3 bg-gray-50 p-3 rounded-lg"
            >

              {/* <div>
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
              {errors[`pgender${index}`] && (
                <p className="text-red-500 text-sm">{errors[`pgender${index}`]}</p>
              )}
            </div> */}

              <div>
                <label className="block text-gray-600 mb-1">honorifics</label>
                <select
                  value={passenger.honorifics}
                  onChange={(e) =>
                    handlePassengerChange(index, "honorifics", e.target.value)
                  }
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
                <label className="block text-gray-600 mb-1">
                  Passenger {index + 1} Name
                </label>

                <Demo1 formData={passengerDetails} setFormData={setPassengerDetails} index={index} clientData={clientPassenger} />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Age</label>
                <input
                  type="number"
                  value={passenger.age}
                  onChange={(e) =>
                    handlePassengerChange(index, "age", e.target.value)
                  }
                  className="border rounded-lg px-4 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Gender</label>
                <select
                  value={passenger.gender}
                  onChange={(e) =>
                    handlePassengerChange(index, "gender", e.target.value)
                  }
                  className="border rounded-lg px-4 py-2 w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          ))}
        </div>


        <div className="grid gap-4 items-center">


          <div className="flex justify-end m-full gap-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 border rounded-lg text-gray-600"
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
  );
}
