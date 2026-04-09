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
      primary: { main: "#725af8" },
      secondary: { main: "#03a9f4" },
      error: { main: "#f44336" },
      success: { main: "#4caf50" },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper:   darkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary:   darkMode ? "#f5f5f5" : "#1e1e1e",
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
            "&:hover": { backgroundColor: "#4a36b3" },
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
          paper: { borderRadius: 12 },
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