import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Inventory2 as InventoryIcon,
  Category as CategoryIcon,
  Group as UsersIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useTheme } from "../../providers/ThemeProvider";

/* -----------------------------
   🔗 Enlaces agrupados por sección
------------------------------ */
const menuSections = [
  {
    title: "Principal",
    items: [
      { to: "/", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> },
    ],
  },
  {
    title: "Gestión",
    items: [
      { to: "/purchases", label: "Compras", icon: <StoreIcon fontSize="small" /> },
      { to: "/sales", label: "Ventas", icon: <StoreIcon fontSize="small" /> },
    ],
  },
  {
    title: "Sucursales",
    items: [
      { to: "/branches", label: "Sucursales", icon: <StoreIcon fontSize="small" /> },
      { to: "/branches-products", label: "Productos Sucursal", icon: <StoreIcon fontSize="small" /> },
    ],
  },
  {
    title: "Inventario",
    items: [
      { to: "/inventory-transactions", label: "Movimientos", icon: <InventoryIcon fontSize="small" /> },
    ],
  },
  {
    title: "Productos",
    items: [
      { to: "/categories", label: "Categorías", icon: <CategoryIcon fontSize="small" /> },
      { to: "/products", label: "Productos", icon: <InventoryIcon fontSize="small" /> },
    ],
  },
  {
    title: "Usuarios",
    items: [
      { to: "/users", label: "Usuarios", icon: <UsersIcon fontSize="small" /> },
    ],
  },
];

export default function Sidebar({ open, setOpen, onCollapseChange }) {
  const { pathname } = useLocation();
  const { darkMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
  }, [collapsed]);

  return (
    <aside
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-64"} md:translate-x-0
        ${collapsed ? "w-16" : "w-64"}
        ${darkMode ? "bg-black text-white" : "bg-white/80 text-slate-900"}
        shadow-md`}
    >
      {/* -----------------------------
         🧭 Encabezado del sidebar
      ------------------------------ */}
      <div
        className={`h-16 flex items-center justify-between px-4 border-b transition-colors duration-300
          ${darkMode ? "border-slate-800 text-white" : "border-slate-200 text-slate-800"}`}
      >
        {!collapsed && <h2 className="font-semibold text-lg">Lechu'Snacks</h2>}

        {/* Botón colapsar/expandir */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-md transition ${
            darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
          }`}
        >
          <MenuIcon fontSize="small" />
        </button>
      </div>

      {/* -----------------------------
         📋 Navegación del menú
      ------------------------------ */}
      <nav className="mt-4 px-2 space-y-3">
        {menuSections.map((section) => (
          <div key={section.title}>
            {/* 🔹 Subtítulo de sección */}
            {!collapsed && (
              <h3
                className={`px-3 py-1 text-xs uppercase font-semibold tracking-wider ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {section.title}
              </h3>
            )}

            {/* 🔸 Enlaces */}
            {section.items.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? darkMode
                        ? "bg-[#1e293b] text-indigo-300"
                        : "bg-indigo-100 text-indigo-700"
                      : darkMode
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-black"
                  }`}
                >
                  <span className="flex items-center justify-center w-6">{l.icon}</span>
                  {!collapsed && <span className="truncate">{l.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
