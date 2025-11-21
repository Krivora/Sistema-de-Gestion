import { Link, useLocation } from "react-router-dom";
import { ability } from "@core/casl/ability";
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

export default function Sidebar({ open, setOpen, collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const { darkMode } = useTheme();
  const { user,logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

 // === Nuevo menú basado en permisos ===
const menuStructure = [
  {
    title: "Principal",
    items: [
      { to: "/", label: "Dashboard", icon: <DashboardIcon fontSize="small" />, permission: null },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { to: "/purchases",  label: "Compras",        icon: <ShoppingCartIcon fontSize="small" />, permission: ["read", "purchases"] },
      { to: "/sales",      label: "Ventas",         icon: <ReceiptIcon fontSize="small" />,      permission: ["read", "sales"] },
      { to: "/transfers",  label: "Transferencias", icon: <SwapHoriz fontSize="small" />,        permission: ["read", "transfers"] },
      { to: "/adjustments",label: "Ajustes",        icon: <Handyman fontSize="small" />,         permission: ["read", "adjustments"] },
    ],
  },
  {
    title: "Inventario",
    items: [
      { to: "/branches-products",      label: "Productos Sucursal", icon: <WarehouseIcon fontSize="small" />, permission: ["read", "branch_products"] },
      { to: "/inventory-transactions", label: "Movimientos",        icon: <InventoryIcon fontSize="small" />, permission: ["read", "inventory"] },
      { to: "/products",               label: "Productos",          icon: <CategoryIcon fontSize="small" />,  permission: ["read", "products"] },
      { to: "/categories",             label: "Categorías",         icon: <LayersIcon fontSize="small" />,    permission: ["read", "categories"] },
    ],
  },
  {
    title: "Administración",
    items: [
      { to: "/users",    label: "Usuarios",   icon: <UsersIcon fontSize="small" />, permission: ["read", "users"] },
      { to: "/branches", label: "Sucursales", icon: <BranchIcon fontSize="small" />, permission: ["read", "branches"] },
      { to: "/reports",  label: "Reportes",   icon: <ReportIcon fontSize="small" />, permission: ["read", "reports"] },
    ],
  },
  {
    title: "Administración SaaS",
    items: [
      { to: "/clients", label: "Clientes", icon: <Supervisor fontSize="small" />, permission: ["read", "clients"] },
    ],
  },
];


const settingsMenu = [
  { 
    to: "/config",
    label: "Configuración",
    icon: <Settings fontSize="small" />,
    permission: ["read", "settings"]
  },
];

const filteredMenu = menuStructure
  .map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!item.permission) return true;

      const [action, subject] = item.permission;
      return ability.can(action, subject);
    }),
  }))
  .filter(section => section.items.length > 0);

// === Filtrado CASL ===
const filteredSettingsMenu = settingsMenu.filter(item => {
  if (!item.permission) return true;

  const [action, subject] = item.permission;
  return ability.can(action, subject);
});


  return (
    <aside
      className={`fixed top-0 left-0 h-full transition-transform duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-64"} md:translate-x-0
        ${collapsed ? "w-16" : "w-64"}
        ${darkMode ? "bg-[#18181a] text-white" : "bg-white text-slate-900"}
        shadow-lg border-r ${darkMode ? "border-slate-800" : "border-slate-200"}
      `}
    >
      {/* Header */}
      <div
        className={`h-16 flex items-center justify-between px-4 border-b ${darkMode ? "border-slate-800" : "border-slate-200"
          }`}
      >
        {!collapsed ? (
          <h2 className="font-semibold text-lg truncate">
            {user?.business_name || "Krivora Admin"}
          </h2>
        ) : (
          <h2 className="text-xl font-bold">{user?.business_name?.[0]?.toUpperCase() || "K"}</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-md transition ${darkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
            }`}
        >
          <MenuIcon fontSize="small" />
        </button>
      </div>

      {/* Menu principal */}
      <nav className="flex flex-col justify-between h-[calc(100%-4rem)]">
        <div className="mt-4 px-2 space-y-2 overflow-hidden">
          {filteredMenu.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3
                  className={`px-3 py-1 text-xs uppercase font-semibold tracking-wider ${darkMode ? "text-gray-500" : "text-gray-500"
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
                    onClick={() => setOpen(false)} // 👈 esto cierra el menú en móvil
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
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

        {/* Footer */}
        <div className="border-t px-2 py-3 space-y-1">
          {filteredSettingsMenu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : ""}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${pathname === item.to
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${darkMode
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
