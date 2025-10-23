import { useState, useEffect, useRef } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ThemeToggle from ".//ThemeToggle";
import { useAuth } from "@/context/AuthProvider"; // 👈 nuevo import
import { useTheme } from "@/context/ThemeProvider";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setOpen }) {
  const { user, logout } = useAuth(); // 👈 logout en lugar de handleLogout
  const { darkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true }); // 👈 redirige al login
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md transition-colors duration-300 ${
        darkMode ? "bg-black text-white" : "bg-white/80 text-slate-900"
      }`}
    >
      <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between relative">
        {/* Botón Sidebar (solo móvil) */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`md:hidden p-2 rounded-md transition ${
            darkMode
              ? "hover:bg-slate-800 text-white"
              : "hover:bg-slate-100 text-slate-900"
          }`}
        >
          <MenuIcon />
        </button>

        {/* Título */}
        <h1 className="text-lg font-semibold select-none tracking-wide">
          Inventario Multi-Sucursal
        </h1>

        {/* Controles derechos */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Usuario */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
                darkMode
                  ? "hover:bg-slate-800 text-gray-200"
                  : "hover:bg-slate-100 text-gray-800"
              }`}
            >
              <AccountCircleIcon fontSize="medium" />
              <span className="hidden sm:inline text-sm font-medium">
                {user?.name || "Usuario"}
              </span>
              <ArrowDropDownIcon
                className={`transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Menú desplegable */}
            {menuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden animate-fade-in ${
                  darkMode
                    ? "bg-[#1e1e1e] border-slate-700 text-gray-200"
                    : "bg-white border-slate-200 text-gray-800"
                }`}
              >
                <button
                  onClick={handleLogout} // 👈 usa logout directo
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition ${
                    darkMode
                      ? "hover:bg-slate-800"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <LogoutIcon fontSize="small" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
