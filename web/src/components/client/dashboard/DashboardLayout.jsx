// src/components/dashboard/DashboardLayout.jsx
import { useTheme } from "@/context/ThemeProvider";

export default function DashboardLayout({ title, right, children }) {
  const { darkMode } = useTheme();
  return (
    <div className="p-6 space-y-6">
      <div
        className={`sticky top-0 z-10 pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between backdrop-blur-md ${
          darkMode ? "bg-[#111]/80 border-b border-gray-700" : "bg-white/70 border-b border-gray-200"
        }`}
      >
        <h1 className={`text-2xl ml-5 font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{title}</h1>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
