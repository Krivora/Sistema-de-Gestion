import { useState } from "react";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useTheme } from "@core/context/ThemeProvider";
import { useAuth } from "@core/auth/useAuth";
import { UsersApi } from "@features/users/api/users";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleToggle = async () => {
    const newValue = !darkMode;
    toggleDarkMode(newValue); // actualiza UI inmediatamente (optimista)

    if (!user?.id) return; // sin sesión no hay nada que persistir

    setSyncing(true);
    try {
      await UsersApi.updateDarkMode(user.id, newValue);
    } catch (err) {
      // Revertir si el backend falla
      toggleDarkMode(!newValue);
      console.error("No se pudo guardar preferencia de tema:", err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Tooltip title={darkMode ? "Cambiar a claro" : "Cambiar a oscuro"}>
      <span> {/* span necesario para que Tooltip funcione con disabled */}
        <IconButton
          color="inherit"
          onClick={handleToggle}
          disabled={syncing}
          aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
        >
          {syncing
            ? <CircularProgress size={20} color="inherit" />
            : darkMode ? <LightMode /> : <DarkMode />
          }
        </IconButton>
      </span>
    </Tooltip>
  );
}