// src/components/dashboard/DashboardLayout.jsx
import { useTheme } from "../../providers/ThemeProvider";

export default function DashboardLayout({ title, right, children }) {
  const { darkMode } = useTheme();
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
          {title}
        </h1>
        <div className="flex items-center gap-2">{right}</div>
      </div>
      {children}
    </div>
  );
}
