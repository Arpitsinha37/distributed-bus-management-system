



import { useEffect, useMemo, useState } from "react";
import { Plane, Train, Bus, Plus, Search } from "lucide-react";
import BookingSourcescard from "./BookingSourcescard";
import AddBookingSourceModal from "./AddBookingSourceModal";

const defaultSources = {
  flight: [
    { id: "f1", name: "IRCTC Air", desc: "Official IRCTC air booking portal", url: "https://www.air.irctc.co.in/" },
    { id: "f2", name: "MakeMyTrip", desc: "India's leading travel portal", url: "https://www.makemytrip.com" },
    { id: "f3", name: "GoIbibo", desc: "Book flights with best deals", url: "https://www.goibibo.com" },
    { id: "f4", name: "Cleartrip", desc: "Simple, fast booking experience", url: "https://www.cleartrip.com" },
    { id: "f5", name: "IndiGo", desc: "India's largest airline", url: "https://www.goindigo.in" },
    { id: "f6", name: "Air India", desc: "National carrier", url: "https://www.airindia.in" },
    { id: "f7", name: "SpiceJet", desc: "Low-cost carrier", url: "https://www.spicejet.com" },
    { id: "f8", name: "Akasa Air", desc: "India's newest airline", url: "https://www.akasaair.com" },
    { id: "f9", name: "Yatra", desc: "Complete travel solutions", url: "https://www.yatra.com" },
  ],
  railway: [
    { id: "r1", name: "IRCTC", desc: "Official Indian Railways booking", url: "https://www.irctc.co.in" },
    { id: "r2", name: "ConfirmTkt", desc: "Train ticket booking & tracking", url: "https://www.confirmtkt.com" },
    { id: "r3", name: "Trainman", desc: "PNR status & train booking", url: "https://www.trainman.in" },
    { id: "r4", name: "RailYatri", desc: "Train booking & travel planning", url: "https://www.railyatri.in" },
    { id: "r5", name: "Paytm Train", desc: "Book trains on Paytm", url: "https://paytm.com/railways" },
  ],
  bus: [
    { id: "b1", name: "RedBus", desc: "India's largest bus booking platform", url: "https://www.redbus.in" },
    { id: "b2", name: "AbhiBus", desc: "Book bus tickets online", url: "https://www.abhibus.com" },
    { id: "b3", name: "MakeMyTrip Bus", desc: "Bus booking on MMT", url: "https://www.makemytrip.com/bus-tickets" },
    { id: "b4", name: "Goibibo Bus", desc: "Bus tickets with offers", url: "https://www.goibibo.com/bus" },
    { id: "b5", name: "Yatra Bus", desc: "Book bus tickets online", url: "https://www.yatra.com/bus-booking" },
    { id: "b6", name: "Travelyaari", desc: "Bus booking platform", url: "https://www.travelyaari.com" },
  ],
};

export default function BookingSources() {
  const [tab, setTab] = useState("flight");
  const [sources, setSources] = useState(defaultSources);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [query, setQuery] = useState("");

  
  const counts = useMemo(() => ({
    flight: sources.flight.length,
    railway: sources.railway.length,
    bus: sources.bus.length,
  }), [sources]);

 
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources;
    const filterList = (arr) => arr.filter(s => (
      s.name.toLowerCase().includes(q) ||
      (s.desc || "").toLowerCase().includes(q) ||
      (s.url || "").toLowerCase().includes(q)
    ));
    return {
      flight: filterList(sources.flight),
      railway: filterList(sources.railway),
      bus: filterList(sources.bus),
    };
  }, [query, sources]);

  const addSource = (newSource) => {
    const idPrefix = newSource.type.charAt(0);
    const id = `${idPrefix}${Date.now()}`;
    const item = { id, ...newSource };
    setSources((prev) => ({
      ...prev,
      [newSource.type]: [...prev[newSource.type], item],
    }));
    setTab(newSource.type); 
  };

 
  const saveEdit = (updated) => {
    setSources((prev) => {
      const list = prev[updated.type].map((s) => (s.id === updated.id ? updated : s));
      return { ...prev, [updated.type]: list };
    });
    setEditingSource(null);
  };


  const deleteSource = (id, type) => {
    const confirmed = window.confirm("Delete this source?");
    if (!confirmed) return;
    setSources((prev) => ({
      ...prev,
      [type]: prev[type].filter((s) => s.id !== id),
    }));
  };


  const onEditClick = (source) => {
    setEditingSource(source);
    setShowModal(true);
  };


  const onCloseModal = () => {
    setShowModal(false);
    setEditingSource(null);
  };

  return (
    <div className="px-8 py-6">
     
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Booking Sources</h1>
          <p className="text-gray-600 text-sm">Manage quick access to official booking portals</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Add New Source
        </button>
      </div>


      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-full p-1">
              <div className="flex items-center gap-2 px-2 py-1 rounded-full">
                <TabPill icon={Plane} label="Flight" active={tab === "flight"} count={counts.flight} onClick={() => setTab("flight")} />
                <TabPill icon={Train} label="Railway" active={tab === "railway"} count={counts.railway} onClick={() => setTab("railway")} />
                <TabPill icon={Bus} label="Bus" active={tab === "bus"} count={counts.bus} onClick={() => setTab("bus")} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 md:flex-none">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-96">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search booking sources..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>
        </div>

       
        <div className="mt-6">
          {tab === "flight" && (
            <BookingSourcescard
              list={filtered.flight}
              type="flight"
              onEdit={onEditClick}
              onDelete={(id) => deleteSource(id, "flight")}
            />
          )}
          {tab === "railway" && (
            <BookingSourcescard
              list={filtered.railway}
              type="railway"
              onEdit={onEditClick}
              onDelete={(id) => deleteSource(id, "railway")}
            />
          )}
          {tab === "bus" && (
            <BookingSourcescard
              list={filtered.bus}
              type="bus"
              onEdit={onEditClick}
              onDelete={(id) => deleteSource(id, "bus")}
            />
          )}
        </div>
      </div>

      
      {showModal && (
        <AddBookingSourceModal
          onClose={onCloseModal}
          onAdd={addSource}
          editing={editingSource}
          onSaveEdit={saveEdit}
        />
      )}
    </div>
  );
}


function TabPill({ icon: Icon, label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition ${
        active ? "bg-white shadow text-black" : "text-gray-600"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      <span className="ml-1 inline-flex items-center justify-center bg-gray-200 text-xs px-2 py-0.5 rounded-full">
        {count}
      </span>
    </button>
  );
}
