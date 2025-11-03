// src/components/dashboard/DateRangeControls.jsx
import { useTheme } from "@core/context/ThemeProvider";
export default function DateRangeControls({ start, end, onChange, onRefresh }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex flex-wrap gap-2 p-2 rounded-lg border ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      <input
        type="date"
        value={start.slice(0, 10)}
        onChange={(e) => onChange({ start: new Date(e.target.value).toISOString(), end })}
        className={`px-3 py-2 rounded-md text-sm outline-none ${
          darkMode ? "bg-[#111] text-gray-200 border border-gray-700" : "bg-white text-gray-800 border border-gray-200"
        }`}
      />
      <input
        type="date"
        value={end.slice(0, 10)}
        onChange={(e) => onChange({ start, end: new Date(e.target.value).toISOString() })}
        className={`px-3 py-2 rounded-md text-sm outline-none ${
          darkMode ? "bg-[#111] text-gray-200 border border-gray-700" : "bg-white text-gray-800 border border-gray-200"
        }`}
      />
      <button
        onClick={onRefresh}
        className={`px-3 py-2 text-sm rounded-md transition ${
          darkMode ? "bg-[#272727] hover:bg-[#333] text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }`}
      >
        Actualizar
      </button>
    </div>
  );
}
