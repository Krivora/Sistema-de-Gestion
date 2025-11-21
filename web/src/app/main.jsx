import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "@core/context/ThemeProvider";
import { AbilityProvider } from "@core/casl/AbilityContext";
import { AuthProvider } from "@core/context/AuthProvider";
import { useAuth } from "@core/context/useAuth";
import AppRoutes from "@app/routes";
import { Toaster } from "react-hot-toast";
import "@app/index.css";

// 🔹 Adaptar toaster al tema
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
      }}
    />
  );
}

// 🔹 Wrapper que conecta AuthProvider → AbilityProvider
function CaslWrapper({ children }) {
  const { permissions } = useAuth();
  return (
    <AbilityProvider rules={permissions}>
      {children}
    </AbilityProvider>
  );
}

// 🔹 Render principal
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CaslWrapper>
        <ThemeProvider>
          <AppRoutes />
          <ThemedToaster />
        </ThemeProvider>
      </CaslWrapper>
    </AuthProvider>
  </StrictMode>
);
