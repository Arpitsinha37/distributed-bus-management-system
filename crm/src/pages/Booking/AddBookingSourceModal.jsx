



import { useEffect, useState } from "react";
import { X, Plane, Train, Bus } from "lucide-react";


export default function AddBookingSourceModal({ onClose, onAdd, editing = null, onSaveEdit }) {
  const [form, setForm] = useState({
    name: "",
    type: "flight",
    url: "",
    desc: "",
    id: null,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        id: editing.id ?? null,
        name: editing.name ?? "",
        type: editing.type ?? "flight",
        url: editing.url ?? "",
        desc: editing.desc ?? "",
      });
    } else {
      setForm({ id: null, name: "", type: "flight", url: "", desc: "" });
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      alert("Please fill Portal Name and Website URL");
      return;
    }

    const payload = {
      id: form.id,
      name: form.name.trim(),
      type: form.type,
      url: form.url.trim(),
      desc: form.desc.trim(),
    };

    if (editing && onSaveEdit) {
      onSaveEdit(payload);
    } else if (onAdd) {
     
      onAdd(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold">{editing ? "Edit Booking Source" : "Add Booking Source"}</h3>
            <p className="text-sm text-gray-500">
              {editing ? "Update booking portal details" : "Add a new booking portal to the list"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Portal Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., MakeMyTrip"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Type *</label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm appearance-none"
              >
                <option value="flight">Flight</option>
                <option value="railway">Railway</option>
                <option value="bus">Bus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Website URL *</label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Description</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Brief description of the portal"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">
              {editing ? "Save Changes" : "Add Source"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
