import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  ReceiptLong as ReceiptIcon,
  Inventory2 as InventoryIcon,
  Category as CategoryIcon,
  Layers as LayersIcon,
  Assessment as ReportIcon,
  AccountTree as BranchIcon,
  Group as UsersIcon,
  Warehouse as WarehouseIcon,
  Menu as MenuIcon,
  SupervisorAccount as Supervisor,
  SwapHoriz, Handyman, Settings, Logout
} from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";
import { useAuth } from "@core/context/AuthProvider";

export default function Sidebar({ open, setOpen,  onCollapseChange }) {
  

  const { pathname } = useLocation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const role = user?.role_name;
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    // 🔐 Aquí puedes limpiar token o redirigir al login
    console.log("Logout...");
  };
  const handleCollapse = (value) => {
    setCollapsed(value);
    if (onCollapseChange) onCollapseChange(value);
  };

  function getMenuByRole(role) {
    const baseMenu = [
      {
        title: "Principal",
        items: [{ to: "/", label: "Dashboard", icon: <DashboardIcon fontSize="small" /> }],
      },
    ];

    const adminMenu = [
      {
        title: "Gestión",
        items: [
          { to: "/purchases", label: "Compras", icon: <ShoppingCartIcon fontSize="small" /> },
          { to: "/sales", label: "Ventas", icon: <ReceiptIcon fontSize="small" /> },
          { to: "/transfers", label: "Transferencias", icon: <SwapHoriz fontSize="small" /> },
          { to: "/adjustments", label: "Ajustes", icon: <Handyman fontSize="small" /> },
        ],
      },
      {
        title: "Inventario",
        items: [
          { to: "/branches", label: "Sucursales", icon: <BranchIcon fontSize="small" /> },
          { to: "/branches-products", label: "Productos Sucursal", icon: <WarehouseIcon fontSize="small" /> },
          { to: "/inventory-transactions", label: "Movimientos", icon: <InventoryIcon fontSize="small" /> },
        ],
      },
      {
        title: "Productos",
        items: [
          { to: "/categories", label: "Categorías", icon: <LayersIcon fontSize="small" /> },
          { to: "/products", label: "Productos", icon: <CategoryIcon fontSize="small" /> },
        ],
      },
      {
        title: "Usuarios",
        items: [
          { to: "/users", label: "Usuarios", icon: <UsersIcon fontSize="small" /> },
          { to: "/reports", label: "Reportes", icon: <ReportIcon fontSize="small" /> },
        ],
      },
    ];

    const superadminExtra = [
      {
        title: "Administración SaaS",
        items: [
          { to: "/clients", label: "Clientes", icon: <Supervisor fontSize="small" /> },
        ],
      },
    ];

    if (role === "superadmin") return [...baseMenu, ...superadminExtra];
    if (role === "admin") return [...baseMenu, ...adminMenu];
    return baseMenu;
  }

  const settingsMenu = [
    { to: "/config", label: "Configuración", icon: <Settings fontSize="small" /> },
  ];

  return (
    <aside
      onMouseEnter={() => handleCollapse(false)}
      onMouseLeave={() => handleCollapse(true)}
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-64"} md:translate-x-0
        ${collapsed ? "w-16" : "w-64"}
        ${darkMode ? "bg-[#18181a] text-white" : "bg-white text-slate-900"}
        shadow-lg border-r ${darkMode ? "border-slate-800" : "border-slate-200"}
      `}
    >
      {/* Header */}
      <div
        className={`h-16 flex items-center justify-between px-4 border-b
          ${darkMode ? "border-slate-800" : "border-slate-200"}`}
      >
        {!collapsed ? (
          <h2 className="font-semibold text-lg truncate">
            {user?.business_name || "Krivora Admin"}
          </h2>
        ) : (
          <h2 className="text-xl font-bold">K</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-md transition ${
            darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
          }`}
        >
          <MenuIcon fontSize="small" />
        </button>
      </div>

      {/* Menu principal */}
      <nav className="flex flex-col justify-between h-[calc(100%-4rem)]">
        <div className="mt-4 px-2 space-y-2 overflow-hidden">
          {getMenuByRole(role).map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3
                  className={`px-3 py-1 text-xs uppercase font-semibold tracking-wider ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {section.title}
                </h3>
              )}
              {section.items.map((l) => {
                const active = pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    title={collapsed ? l.label : ""}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? darkMode
                          ? "bg-indigo-900 text-indigo-300"
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
        </div>

        {/* Footer con Configuración y Logout */}
        <div className="border-t px-2 py-3 space-y-1">
          {settingsMenu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : ""}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === item.to
                  ? darkMode
                    ? "bg-indigo-900 text-indigo-300"
                    : "bg-indigo-100 text-indigo-700"
                  : darkMode
                    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-black"
              }`}
            >
              <span className="flex items-center justify-center w-6">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              darkMode
                ? "text-slate-300 hover:bg-red-900 hover:text-white"
                : "text-slate-700 hover:bg-red-100 hover:text-red-700"
            }`}
          >
            <span className="flex items-center justify-center w-6">
              <Logout fontSize="small" />
            </span>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
