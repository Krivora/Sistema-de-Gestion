import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "@core/context/ThemeProvider";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // 🔹 Estado centralizado aquí
  const { darkMode } = useTheme();

  const marginLeft = collapsed ? "md:ml-16" : "md:ml-64";

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#121212] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* 🔹 Pasamos collapsed y setCollapsed como props */}
      <Sidebar
        open={open}
        setOpen={setOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

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
