

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";


import AdminLayout from "./layouts/AdminLayout";
import AgentLayout from "./layouts/AgentLayout";


import AdminDashboard from "./pages/Admin/AdminDashboard";
import Agents from "./pages/Admin/Agents";
import AdminInquiry from "./pages/Admin/AdminInquiry";
import AdminBookings from "./pages/Admin/AdminBookings";
import BookingSources from "./pages/Booking/BookingSources";

import CancellationForm from "./pages/Booking/CancellationForm"
import Campany from "./pages/Booking/campany";
import Editebookingformrail from "./pages/Booking/Editebookingformrail";
import Editebookingformflite from "./pages/Booking/Editebookingformflite";
import Editebookingformbus from "./pages/Booking/Editebookingformbus";
import CustomerStatus from "./pages/CustomerStatus";

import AgentDashboard from "./pages/Agent/AgentDashboard";
import AgentInquiry from "./pages/Agent/AgentInquiry";
import AgentBookings from "./pages/Agent/AgentBookings";


import FlightBooking from "./pages/Booking/FlightBooking";
import TrainBooking from "./pages/Booking/TrainBooking";
import BusBooking from "./pages/Booking/BusBooking";
import UpdateBooking from "./pages/Booking/UpdateBooking";
import CancelBooking from "./pages/Booking/CancelBooking";

import Canceldbooking from "./pages/Booking/Canceldbooking";
import EditBookingDetails from "./pages/Booking/EditBookingDetails"; 
import NotFound from "./pages/NotFound";
import CashBook from "./pages/Accounts.jsx/CashBook";
import ShowLedger from "./pages/Accounts.jsx/ShowLedger";

import Print from "./pages/print";
import AllBill from "./pages/AllBill";
import AllPassanger from "./pages/AllPassanger";
import Allclients from "./pages/Allclients";


function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<Login />} />

  
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="inquiry" element={<AdminInquiry />} />
          <Route path="bookings" element={<AdminBookings />} />

          
          <Route path="booking/flight" element={<FlightBooking />} />
          <Route path="booking/train" element={<TrainBooking />} />
          <Route path="booking/bus" element={<BusBooking />} />

         
          <Route path="update-booking" element={<UpdateBooking />} />
          <Route path="cancel-booking" element={<CancelBooking />} />
          {/* <Route path="Conform-booking" element={<ConformBooking/>} */}
          <Route path="canceld-booking" element={<Canceldbooking/>}/>
          <Route path="cancel-from/:type/:id"  element={<CancellationForm />} />
          

          <Route
            path="booking/update-booking/:mode/:id"
            element={<EditBookingDetails />}
          />
          <Route path="allpassanger" element={<AllPassanger/>}/>
          <Route path="allclient" element={<Allclients/>}/>
          <Route path="booking-sources" element={<BookingSources />} />
          {/* <Route path="accounting" element={<Accounting />} /> */}
          <Route path="CustomerStatus" element={<CustomerStatus />} />
          <Route path="accounts/cash-book" element={<CashBook />} />
          
          <Route path="ShowLager" element={<ShowLedger />} />
          <Route path="print" element={<Print />} />
          <Route path="AllBill" element={<AllBill />} />
          <Route path="campany" element={<Campany />} />
           <Route path="editbookingform-flight/:id" element={<Editebookingformflite/>}/>
           <Route path="editbookingform-bus/:id" element={<Editebookingformbus/>}/>
           <Route path="editbookingform-rail/:id" element={<Editebookingformrail/>}/>
            
        </Route>

        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<AgentDashboard />} />
          <Route path="inquiry" element={<AgentInquiry />} />
          <Route path="bookings" element={<AgentBookings />} />

          
          <Route path="booking/flight" element={<FlightBooking />} />
          <Route path="booking/train" element={<TrainBooking />} />
          <Route path="booking/bus" element={<BusBooking />} />
          <Route path="print" element={<Print />} />
          <Route path="AllBill" element={<AllBill />} />
          <Route path="update-booking" element={<UpdateBooking />} />
           <Route path="CustomerStatus" element={<CustomerStatus />} />
          <Route path="accounts/cash-book" element={<CashBook />} />
          
          <Route path="ShowLager" element={<ShowLedger />} />
          {/* <Route path="cancel-booking" element={<CancelBooking />} /> */}
           <Route path="canceld-booking" element={<Canceldbooking/>}/>
          <Route path="cancel-from/:type/:id"  element={<CancellationForm />} />
          <Route path="editbookingform-flight/:id" element={<Editebookingformflite/>}/>
           <Route path="editbookingform-bus/:id" element={<Editebookingformbus/>}/>
           <Route path="editbookingform-rail/:id" element={<Editebookingformrail/>}/>
    
          <Route
            path="booking/update-booking/:mode/:id"
            element={<EditBookingDetails />}
          />

          <Route path="booking-sources" element={<BookingSources />} />
          <Route path="campany" element={<Campany />} />
          
         
        </Route>

        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
