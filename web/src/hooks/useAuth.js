// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { AuthApi } from "../api/auth";
import { useTheme } from "../providers/ThemeProvider";
import { useNavigate } from "react-router-dom";
export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  // 🔹 Sincronizar el modo oscuro cuando el usuario cambia
  useEffect(() => {
    if (user && typeof user.dark_mode === "boolean") {
      const isDifferent = user.dark_mode !== darkMode;
      if (isDifferent) {
        // Aplica el tema del usuario sin cambiarlo en backend
        document.documentElement.classList.toggle("dark", user.dark_mode);
      }
    }
  }, [user]);

  // 🔹 Login
  async function handleLogin(email, password) {
    setLoading(true);
    try {
      const loggedUser = await AuthApi.login(email, password);
      setUser(loggedUser);

      // Aplicar el modo oscuro del usuario recién logueado
      if (typeof loggedUser.dark_mode === "boolean") {
        document.documentElement.classList.toggle("dark", loggedUser.dark_mode);
        localStorage.setItem("darkMode", loggedUser.dark_mode);
      }

      return true;
    } catch (err) {
      console.error("Error en login:", err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Logout
  function handleLogout() {
    AuthApi.logout();
    setUser(null);
    localStorage.removeItem("darkMode");
    document.documentElement.classList.remove("dark");
    navigate("/login"); // 👈 redirige desde el hook
  }
  
  return { user, loading, handleLogin, handleLogout, setUser };
}
