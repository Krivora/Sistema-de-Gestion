import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

const ThemeContext = createContext(null);

function applyThemeToDOM(isDark) {
  if (isDark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  sessionStorage.setItem("darkMode", String(isDark));
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Inicialización síncrona — sin async, sin API calls
    const stored = sessionStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Aplicar al DOM cuando cambie
  useEffect(() => {
    applyThemeToDOM(darkMode);
    // Inyectar variables del sidebar según tema
    const r = document.documentElement;
    if (darkMode) {
      r.style.setProperty("--sidebar-bg-from", "#0d0f1a");
      r.style.setProperty("--sidebar-bg-mid", "#111320");
      r.style.setProperty("--sidebar-bg-to", "#0f1117");
      r.style.setProperty("--sidebar-glow-primary", "#7c6ff7");
      r.style.setProperty("--sidebar-glow-secondary", "#38bdf8");
      r.style.setProperty("--gradient-accent", "linear-gradient(135deg,#7c6ff7,#38bdf8)");
    } else {
      r.style.setProperty("--sidebar-bg-from", "#1a1440");
      r.style.setProperty("--sidebar-bg-mid", "#1e1750");
      r.style.setProperty("--sidebar-bg-to", "#1b1648");
      r.style.setProperty("--sidebar-glow-primary", "#5b4ef0");
      r.style.setProperty("--sidebar-glow-secondary", "#0284c7");
      r.style.setProperty("--gradient-accent", "linear-gradient(135deg,#5b4ef0,#0284c7)");
    }
  }, [darkMode]);

  // toggleDarkMode recibe opcionalmente el userId para persistir en backend
  // Lo llama quien tiene el contexto de auth (Navbar, UserMenu, etc.)
  const toggleDarkMode = useCallback((newValue) => {
    const value = typeof newValue === "boolean" ? newValue : !darkMode;
    setDarkMode(value);
  }, [darkMode]);

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? "#7c6ff7" : "#5b4ef0" },
      secondary: { main: "#0284c7" },
      error: { main: "#dc2626" },
      success: { main: darkMode ? "#22c55e" : "#16a34a" },
      warning: { main: darkMode ? "#f59e0b" : "#d97706" },
      background: {
        default: darkMode ? "#0f1117" : "#f4f6fb",
        paper: darkMode ? "#181c27" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#e8ecf4" : "#1a1f36",
        secondary: darkMode ? "#8b94b0" : "#5a6378",
      },
      divider: darkMode ? "#2a3048" : "#dde2ee",
    },
    shape: { borderRadius: 10 },
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
            "&:hover": { backgroundColor: darkMode ? "#6558e8" : "#4438d4" },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundImage: "none",
            boxShadow: darkMode
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(26,31,54,0.08)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 14 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: darkMode ? "#2a3048" : "#dde2ee",
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
};