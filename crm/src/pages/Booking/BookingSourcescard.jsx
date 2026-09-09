
import { ExternalLink, Plane, Train, Bus, Edit2, Trash2 } from "lucide-react";

export default function BookingSourcescard({ list = [], type = "flight", onEdit, onDelete }) {
  const getIcon = () => {
    if (type === "railway") return <Train className="h-4 w-4 text-green-500 " />;
    if (type === "bus") return <Bus className="h-4 w-4 text-orange-500" />;
    return <Plane className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {list.map((src) => (
        <div
          key={src.id ?? src.name}
          className="bg-white border rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-base font-medium">{src.name}</h3>
            <div className="text-sm">{getIcon()}</div>
          </div>

          <p className="text-sm text-gray-500 flex-1">{src.desc}</p>

          <a
          
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full border rounded-lg py-3 text-sm font-medium bg-blue-600 text-white text-blue-900 hover:bg-white border-gray-300"
            style={{ minHeight: 44 }}
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onEdit && onEdit(src)}
              className="inline-flex items-center justify-center border rounded-md p-2 hover:bg-gray-50"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(src.id)}
              className="inline-flex items-center justify-center border rounded-md p-2 hover:bg-gray-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
