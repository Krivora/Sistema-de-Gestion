// src/components/dashboard/KpiCard.jsx
import { useTheme } from "../../providers/ThemeProvider";

export default function KpiCard({ icon, label, value, accent = "blue" }) {
  const { darkMode } = useTheme();
  const accents = {
    blue: "text-blue-500",
    green: "text-green-500",
    orange: "text-orange-500",
    red: "text-red-500",
    amber: "text-amber-500",
  };

  return (
    <div
      className={`rounded-xl border shadow-sm p-4 flex items-center gap-4 transition hover:scale-[1.01] ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      <div className={`${accents[accent]} shrink-0`}>{icon}</div>
      <div>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        <p className={`text-2xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{value}</p>
      </div>
    </div>
  );
}
