// src/providers/ThemeProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { UsersApi } from "../api/users";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [loaded, setLoaded] = useState(false); // evitar parpadeo

  // 🔹 Al montar, sincronizar desde backend o localStorage
  useEffect(() => {
    const initTheme = async () => {
      try {
        const userJson = localStorage.getItem("user");

        if (userJson) {
          const user = JSON.parse(userJson);

          // Si ya hay darkMode en localStorage
          if (typeof user.dark_mode === "boolean") {
            setDarkMode(user.dark_mode);
            applyTheme(user.dark_mode);
          }

          // Pedir versión más fresca desde backend
          try {
            const freshUser = await UsersApi.get(user.id);
            if (freshUser?.dark_mode !== undefined) {
              setDarkMode(freshUser.dark_mode);
              applyTheme(freshUser.dark_mode);

              // actualizar localStorage
              localStorage.setItem("user", JSON.stringify(freshUser));
            }
          } catch (err) {
            console.warn("No se pudo sincronizar tema con backend:", err.message);
          }
        } else {
          // Sin usuario → usar preferencia local o sistema
          const stored = localStorage.getItem("darkMode");
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          const initial = stored ? stored === "true" : prefersDark;
          setDarkMode(initial);
          applyTheme(initial);
        }
      } finally {
        setLoaded(true);
      }
    };

    initTheme();
  }, []);

  // 🔹 Aplicar la clase dark/light al <html>
  const applyTheme = (isDark) => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", isDark);
  };

  // 🔹 Cambiar tema manualmente
  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    applyTheme(newValue);

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        await UsersApi.updateDarkMode(user.id, newValue);
        localStorage.setItem("user", JSON.stringify({ ...user, dark_mode: newValue }));
      } catch (err) {
        console.error("Error actualizando dark mode en backend:", err.message);
      }
    }
  };

  // 🔹 Configurar tema de MUI
  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#800000ff" },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
    shape: { borderRadius: 8 },
  });

  // ⏳ Mostrar solo cuando el tema esté listo (sin flash)
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
