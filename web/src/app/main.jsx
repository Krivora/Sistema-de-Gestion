import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, useTheme } from "@core/context/ThemeProvider";
import { AuthProvider } from "@core/context/AuthProvider";
import AppRoutes from "@app/routes";
import { Toaster } from "react-hot-toast";
import "@app/index.css";

// 🔹 Componente que adapta el toast al tema actual
function ThemedToaster() {
  const { darkMode } = useTheme();

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "8px",
          background: darkMode ? "#1e1e1e" : "#fff",
          color: darkMode ? "#f5f5f5" : "#111",
          border: darkMode ? "1px solid #333" : "1px solid #ddd",
        },
        success: {
          iconTheme: {
            primary: "#4ade80",
            secondary: darkMode ? "#1e1e1e" : "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: darkMode ? "#1e1e1e" : "#fff",
          },
        },
      }}
    />
  );
}

// 🔹 Render principal
createRoot(document.getElementById("root")).render(
  <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <ThemedToaster />
        </AuthProvider>
      </ThemeProvider>
  </StrictMode>
);
