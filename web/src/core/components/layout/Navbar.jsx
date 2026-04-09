import { useState, useEffect, useRef } from "react";
import MenuIcon         from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon       from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ThemeToggle      from "./ThemeToggle";
import { useAuth }      from "@core/auth/useAuth";
import { useTheme }     from "@core/context/ThemeProvider";
import { useNavigate }  from "react-router-dom";

export default function Navbar({ setOpen }) {
  const { user, logout } = useAuth();
  const { darkMode }     = useTheme();
  const navigate         = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center px-4 md:px-6 gap-3"
      style={{
        background:   "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Hamburguesa móvil */}
      <button
        onClick={() => setOpen(p => !p)}
        aria-label="Abrir menú lateral"
        className="md:hidden p-2 rounded-lg transition-colors"
        style={{ color: "var(--color-text-secondary)" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-2)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <MenuIcon sx={{ fontSize: 22 }} />
      </button>

      {/* Título */}
      <h1
        className="flex-1 text-base font-semibold tracking-tight select-none truncate"
        style={{ color: "var(--color-text-primary)" }}
      >
        {user?.business_name ?? "Inventario Multi-Sucursal"}
      </h1>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-2)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Avatar inicial */}
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, var(--color-primary), #38bdf8)" }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="hidden sm:block truncate max-w-[120px]" style={{ color: "var(--color-text-primary)" }}>
              {user?.name ?? "Usuario"}
            </span>
            <ArrowDropDownIcon
              sx={{
                fontSize: 18,
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                color: "var(--color-text-muted)",
              }}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-1.5 w-52 rounded-xl overflow-hidden animate-fade-in z-50"
              style={{
                background:  "var(--color-surface)",
                border:      "1px solid var(--color-border)",
                boxShadow:   "var(--shadow-lg)",
              }}
            >
              {/* Info usuario */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--color-border-soft)" }}
              >
                <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                  {user?.name ?? "Usuario"}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {user?.email ?? ""}
                </p>
              </div>

              {/* Logout */}
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                style={{ color: "var(--color-danger)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--color-danger-soft)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}