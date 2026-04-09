import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAbility } from "@core/auth/AbilityContext";
import { useTheme } from "@core/context/ThemeProvider";
import { useAuth } from "@core/auth/useAuth";
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
  SupervisorAccount as SupervisorIcon,
  SwapHoriz, Handyman, Settings, Logout,
  ExpandMore,
} from "@mui/icons-material";

// ── Menú ─────────────────────────────────────────────────────────────────────

const MENU = [
  {
    title: "Principal",
    items: [
      { to: "/",            label: "Dashboard",       icon: DashboardIcon,    permission: null },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { to: "/purchases",   label: "Compras",         icon: ShoppingCartIcon, permission: ["read","purchases"] },
      { to: "/sales",       label: "Ventas",          icon: ReceiptIcon,      permission: ["read","sales"] },
      { to: "/transfers",   label: "Transferencias",  icon: SwapHoriz,        permission: ["read","transfers"] },
      { to: "/adjustments", label: "Ajustes",         icon: Handyman,         permission: ["read","adjustments"] },
    ],
  },
  {
    title: "Inventario",
    items: [
      { to: "/branches-products",      label: "Prod. Sucursal", icon: WarehouseIcon, permission: ["read","branch_products"] },
      { to: "/inventory-transactions", label: "Movimientos",    icon: InventoryIcon, permission: ["read","inventory"] },
      { to: "/products",               label: "Productos",      icon: CategoryIcon,  permission: ["read","products"] },
      { to: "/categories",             label: "Categorías",     icon: LayersIcon,    permission: ["read","categories"] },
    ],
  },
  {
    title: "Administración",
    items: [
      { to: "/users",    label: "Usuarios",   icon: UsersIcon,     permission: ["read","users"] },
      { to: "/branches", label: "Sucursales", icon: BranchIcon,    permission: ["read","branches"] },
      { to: "/reports",  label: "Reportes",   icon: ReportIcon,    permission: ["read","reports"] },
    ],
  },
  {
    title: "SaaS",
    items: [
      { to: "/clients",  label: "Clientes",   icon: SupervisorIcon, permission: ["read","clients"] },
    ],
  },
];

const SETTINGS_ITEM = {
  to: "/config", label: "Configuración", icon: Settings, permission: ["read","settings"],
};

// Bottom nav — los 4 más importantes para móvil
const BOTTOM_NAV_PATHS = ["/", "/sales", "/purchases", "/inventory-transactions"];

// ── NavLink ───────────────────────────────────────────────────────────────────

function NavLink({ item, collapsed, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === item.to;
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`
        group relative flex items-center gap-3 px-3 py-2 rounded-xl
        text-sm font-medium transition-all duration-150 min-h-[40px]
        ${active
          ? "bg-white/10 text-white shadow-sm"
          : "text-white/50 hover:bg-white/7 hover:text-white/80"
        }
      `}
    >
      {/* Indicador activo */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400" />
      )}

      <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 transition-colors ${active ? "text-violet-300" : "text-white/40 group-hover:text-white/70"}`}>
        <Icon sx={{ fontSize: 17 }} />
      </span>

      {!collapsed && (
        <span className="truncate leading-none tracking-wide">{item.label}</span>
      )}
    </Link>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ open, setOpen, collapsed, setCollapsed }) {
  const { darkMode }     = useTheme();
  const { user, logout } = useAuth();
  const ability          = useAbility();
  const navigate         = useNavigate();
  const { pathname }     = useLocation();
  const sidebarRef       = useRef(null);

  // Click fuera → cerrar en móvil
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  // Bloquear scroll del body cuando sidebar móvil está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  // Filtrar por permisos CASL
  const filteredMenu = MENU
    .map(s => ({
      ...s,
      items: s.items.filter(i => !i.permission || ability.can(i.permission[0], i.permission[1])),
    }))
    .filter(s => s.items.length > 0);

  const showSettings = !SETTINGS_ITEM.permission ||
    ability.can(SETTINGS_ITEM.permission[0], SETTINGS_ITEM.permission[1]);

  // Bottom nav: todos los items del menú principal para móvil (primeros 4 + "más")
  const allItems = filteredMenu.flatMap(s => s.items);
  const bottomPrimary = allItems.filter(i => BOTTOM_NAV_PATHS.includes(i.to));
  const bottomHasMore = allItems.length > 4;

  const initial = user?.business_name?.[0]?.toUpperCase() ?? "K";
  const bgClass = darkMode
    ? "bg-[#13131a] border-white/[0.06]"
    : "bg-[#1e1b4b] border-white/[0.08]";

  return (
    <>
      {/* ── Overlay móvil ── */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar desktop + drawer móvil ── */}
      <aside
        ref={sidebarRef}
        aria-label="Menú de navegación"
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          transition-all duration-300 ease-in-out
          border-r ${bgClass}
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "md:w-[68px]" : "md:w-60"}
          w-64
          pb-20 md:pb-0
        `}
        style={{
          background: darkMode
            ? "linear-gradient(160deg, #13131a 0%, #1a1033 50%, #0e1a3a 100%)"
            : "linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #1e3a5f 100%)",
        }}
      >
        {/* Glow decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #725af8 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-20 left-0 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #03a9f4 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />

        {/* ── Header / Brand ── */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-white/[0.07]">
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #725af8, #03a9f4)" }}>
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate leading-tight">
                  {user?.business_name || "Krivora"}
                </p>
                <p className="text-[10px] text-white/35 truncate">Multi-sucursal</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #725af8, #03a9f4)" }}>
              {initial}
            </div>
          )}

          <button
            onClick={() => setCollapsed(p => !p)}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className={`
              hidden md:flex items-center justify-center w-7 h-7 rounded-lg
              text-white/30 hover:text-white/70 hover:bg-white/8 transition-all
              ${collapsed ? "mx-auto" : "ml-2 flex-shrink-0"}
            `}
          >
            <ExpandMore sx={{ fontSize: 16, transform: collapsed ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.2s" }} />
          </button>
        </div>

        {/* ── Menú scrollable ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-5
          [&::-webkit-scrollbar]:w-0"
        >
          {filteredMenu.map(section => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-white/25 select-none">
                  {section.title}
                </p>
              )}
              {collapsed && <div className="my-1 mx-3 border-t border-white/[0.07]" />}
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-2.5 pb-3 pt-2 border-t border-white/[0.07] space-y-0.5">
          {showSettings && (
            <NavLink
              item={SETTINGS_ITEM}
              collapsed={collapsed}
              onClick={() => setOpen(false)}
            />
          )}

          {/* Usuario */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mt-1">
              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #725af8, #03a9f4)" }}>
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white/75 truncate leading-tight">{user?.name ?? "Usuario"}</p>
                <p className="text-[10px] text-white/30 truncate">{user?.role_name ?? ""}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Cerrar sesión" : undefined}
            aria-label="Cerrar sesión"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl min-h-[40px]
              text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10
              transition-all duration-150"
          >
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              <Logout sx={{ fontSize: 17 }} />
            </span>
            {!collapsed && <span className="truncate">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── Bottom Navigation (solo móvil) ── */}
      <nav
        aria-label="Navegación principal"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around
          h-16 px-2 border-t border-white/[0.08]"
        style={{
          background: darkMode
            ? "linear-gradient(0deg, #13131a, #1a1033)"
            : "linear-gradient(0deg, #1e1b4b, #312e81)",
          backdropFilter: "blur(12px)",
        }}
      >
        {bottomPrimary.slice(0, 4).map(item => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[52px] transition-all"
              style={{ background: active ? "rgba(114,90,248,0.18)" : "transparent" }}
            >
              <Icon sx={{ fontSize: 20, color: active ? "#a78bfa" : "rgba(255,255,255,0.35)" }} />
              <span className={`text-[10px] font-medium ${active ? "text-violet-300" : "text-white/30"}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-2 w-1 h-1 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}

        {bottomHasMore && (
          <button
            onClick={() => setOpen(true)}
            aria-label="Ver más opciones"
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[52px] transition-all hover:bg-white/5"
          >
            <span className="flex flex-col gap-[3px] items-center justify-center w-5 h-5">
              <span className="w-4 h-[2px] rounded-full bg-white/35" />
              <span className="w-3 h-[2px] rounded-full bg-white/35" />
              <span className="w-4 h-[2px] rounded-full bg-white/35" />
            </span>
            <span className="text-[10px] font-medium text-white/30">Más</span>
          </button>
        )}
      </nav>
    </>
  );
}