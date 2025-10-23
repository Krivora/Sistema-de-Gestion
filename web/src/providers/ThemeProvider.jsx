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
      primary: { main: "#4529e6ff" }, // violeta principal
      secondary: { main: "#03a9f4" }, // azul claro opcional
      error: { main: "#f44336" }, // rojo estándar MUI
      success: { main: "#4caf50" }, // verde éxito
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#f5f5f5" : "#1e1e1e",
        secondary: darkMode ? "#b0b0b0" : "#555555",
      },
    },

    shape: { borderRadius: 8 },

    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      fontSize: 14,
      h1: { fontWeight: 600, fontSize: "2rem" },
      h2: { fontWeight: 600, fontSize: "1.75rem" },
      h3: { fontWeight: 600, fontSize: "1.5rem" },
      button: { textTransform: "none", fontWeight: 500 },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "6px 16px",
            textTransform: "none",
            fontWeight: 500,
            transition: "all 0.2s ease",
          },
          containedPrimary: {
            color: "#fff",
            "&:hover": {
              backgroundColor: "#4a36b3",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: darkMode
              ? "0 1px 3px rgba(0,0,0,0.4)"
              : "0 1px 3px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
          },
        },
      },
    },
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
