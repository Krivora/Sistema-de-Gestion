// src/components/dashboard/ChartCard.jsx
import { useTheme } from "@core/context/ThemeProvider";

export default function ChartCard({ title, right, children, loading }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`rounded-xl border shadow-sm p-4 flex flex-col ${
        darkMode ? "border-gray-700 bg-[#1a1a1a]" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{title}</h3>
        {right}
      </div>

      <div className="flex-1 h-[260px]">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

