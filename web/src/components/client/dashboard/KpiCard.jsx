// src/components/dashboard/KpiCard.jsx
import { useTheme } from "@/context/ThemeProvider";

export default function KpiCard({ icon, label, value, trend, accent = "blue" }) {
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
      className={`rounded-xl border shadow-sm p-4 flex items-center gap-4 transition hover:shadow-md hover:scale-[1.01] ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      <div className={`${accents[accent]} shrink-0`}>{icon}</div>
      <div className="flex flex-col">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        <p className={`text-2xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
          {value}
        </p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend)}% respecto al periodo anterior
          </span>
        )}
      </div>
    </div>
  );
}

