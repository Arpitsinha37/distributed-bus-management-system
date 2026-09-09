import React, { useState } from 'react'

export default function PaymentForm({formData, setFromData}) {


    const handleformData = (field, value) => {

    console.log(field.target.name, "vae", field.target.value);

    if (field.target.name == "ticketAmount") {
      setFromData((prev) => ({
        ...prev,
        totalAmount: Number(field.target.value) + Number(formData.typeServiceCharge || 0) + Number(formData.bookingCharge || 0)+ Number(formData.otherCharge || 0),
        ticketAmount: field.target.value,

      }));
      return
    }

    if (field.target.name == "typeServiceCharge") {
      console.log("check oue");

      setFromData((prev) => ({
        ...prev,
        totalAmount: Number(field.target.value) + Number(formData.ticketAmount)+ Number(formData.bookingCharge),
        typeServiceCharge: field.target.value,

      }));
      return
    }
    if(field.target.name=="bookingCharge"){
     console.log("check other charge");
      setFromData((prev) => ({
        ...prev,
        totalAmount: Number(formData.ticketAmount || 0) + Number(formData.typeServiceCharge || 0)+ Number(field.target.value),
        bookingCharge: field.target.value,
      }));
      return
    }


    if (field.target.name == "paymentAmount") {


      setFromData((prev) => ({
        ...prev,
        remainingBalance: Number(formData.totalAmount) - Number(field.target.value),

        paymentAmount: field.target.value,

      }));
      return
    }
    if(field.target.name=="otherCharge"){
     console.log("check other charge");
      setFromData((prev) => ({
        ...prev,
        // totalAmount: Number(formData.ticketAmount) + Number(formData.typeServiceCharge)+ Number(formData.bookingCharge)  + Number(field.target.value),
        otherCharge: field.target.value,
      }));
      return
    }
  };

  return (
    <div>
         <from>
          <section className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
          <div>
            <label className="text-sm font-medium"> Ticket Amount (₹) *</label>
            <input type="text" onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }} inputmode="numeric" value={formData.ticketAmount} name="ticketAmount" onChange={handleformData} className="w-full border rounded-md px-3 py-2 mt-1" />
          </div>
            <div>
            <label className="text-sm font-medium">Booking  charge (₹)</label>
            <input type="text"   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }} inputmode="numeric" value={formData.bookingCharge} name="bookingCharge" onChange={handleformData} className="w-full border rounded-md px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Ticket Type {formData.ticketType}</label>
            <select 
            // onChange={handleformData}
               onChange={({ target }) => setFromData((prev) => ({ ...prev, ticketType: target.value }))}
             value={formData.ticketType}
             name="ticketType" className="w-full border rounded-md px-3 py-2 mt-1">
              <option value="select tickert type">Select ticket type</option>
              <option value="General">General</option>
              <option value="Tatkal">Tatkal</option>
              <option value="Permium Tatkal ">Permium Tatkal</option>
              <option value="Current Tikart">Current Tikart</option>
              <option value="Confirmation">Confirmation</option>
              <option value="Open Date">Open Date</option>
              <option value="RAC">RAC</option>
              <option value="Boarding">
                Boarding
              </option>

              <optsrion value="sr.Citizen">Other</optsrion>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Type Service Charge (₹)</label>
            <input type="text" onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }} inputmode="numeric"  value={formData.typeServiceCharge} name="typeServiceCharge" onChange={handleformData} className="w-full border rounded-md px-3 py-2 mt-1" />
          </div>
           <div>
            <label className="text-sm font-medium">Other charge (₹)</label>
            <input type="text"   onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }} inputmode="numeric" value={formData.otherCharge} name="otherCharge" onChange={handleformData} className="w-full border rounded-md px-3 py-2 mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Total Amount (₹) </label>
            <input type="text"  onInput={(e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  }} inputmode="numeric"  value={formData?.totalAmount} name="totalAmount" readOnly className="w-full border rounded-md px-3 py-2 mt-1 bg-gray-100" />
          </div>
          
          
         
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Remarks</label>
          <textarea
            rows="3"
            type="text"
            value={formData?.remarks} name="remakrs"
            //  onChange={handleformData} 
             onChange={({ target }) => setFromData((prev) => ({ ...prev, remarks: target.value }))}
            placeholder="Enter any additional remarks..."
            className="w-full border rounded-md px-3 py-2 mt-1"
          ></textarea>
        </div>
      </section>

      

         </from>
    </div>
  )
}
