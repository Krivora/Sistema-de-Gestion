// src/components/dashboard/ChartCard.jsx
import { useTheme } from "../../providers/ThemeProvider";

export default function ChartCard({ title, right, children }) {
  const { darkMode } = useTheme();
  return (
    <div className={`rounded-xl border shadow-sm p-4 ${darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{title}</h3>
        {right}
      </div>
      <div className="h-[260px]">{children}</div>
    </div>
  );
}
