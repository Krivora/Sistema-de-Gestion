import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@core/auth/AuthProvider";
import { ThemeProvider, useTheme } from "@core/context/ThemeProvider";
import AppRoutes from "@app/routes";
import { Toaster } from "react-hot-toast";
import "@app/index.css";

function ThemedToaster() {
  const { darkMode } = useTheme();
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "8px",
          background: darkMode ? "#1e1e1e" : "#fff",
          color:      darkMode ? "#f5f5f5" : "#111",
          border:     darkMode ? "1px solid #333" : "1px solid #ddd",
        },
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
        <ThemedToaster />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);