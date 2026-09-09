import React from "react";
import { useParams } from "react-router-dom";
import EditTrainBookingDetails from "./EditTrainBookingDetails";
import EditFlightBookingDetails from "./EditFlightBookingDetails";
import EditBusBookingDetails from "./EditBusBookingDetails";

const EditBookingDetails = () => {
  const { mode } = useParams();

  switch (mode) {
    case "train":
      return <EditTrainBookingDetails />;
    case "flight":
      return <EditFlightBookingDetails />;
    case "bus":
      return <EditBusBookingDetails />;
    default:
      return (
        <div className="p-6 text-center text-red-600">
           Invalid booking mode — please check URL.
        </div>
      );
  }
};

export default EditBookingDetails;
