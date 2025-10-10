import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../providers/ThemeProvider";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // 👈 nuevo estado
  const { darkMode } = useTheme();

  // 🔸 Calcula margen dinámico (solo en desktop)
  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const marginLeft = collapsed ? "md:ml-16" : "md:ml-64";

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Sidebar open={open} setOpen={setOpen} onCollapseChange={setCollapsed} />

      {/* Ajusta automáticamente el margen del contenido */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${marginLeft}`}
      >
        <Navbar setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
