import { useState } from "react";
import { DarkMode, LightMode } from "@mui/icons-material";
import { CircularProgress, Tooltip, IconButton } from "@mui/material";
import { useTheme } from "@core/context/ThemeProvider";
import { useAuth } from "@core/auth/useAuth";
import { UsersApi } from "@features/users/api/users";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleToggle = async () => {
    const newValue = !darkMode;
    toggleDarkMode(newValue);
    if (!user?.id) return;

    setSyncing(true);
    try {
      await UsersApi.updateDarkMode(user.id, newValue);
    } catch (err) {
      toggleDarkMode(!newValue);
      console.error("No se pudo guardar preferencia de tema:", err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"}>
      <span>
        <IconButton
          onClick={handleToggle}
          disabled={syncing}
          aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          size="small"
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            transition: "all 0.2s",
            "&:hover": {
              background: "var(--color-primary-soft)",
              color: "var(--color-primary)",
              borderColor: "var(--color-primary)",
            },
            "&.Mui-disabled": { opacity: 0.5 },
          }}
        >
          {syncing
            ? <CircularProgress size={15} sx={{ color: "var(--color-primary)" }} />
            : darkMode
              ? <LightMode sx={{ fontSize: 17 }} />
              : <DarkMode   sx={{ fontSize: 17 }} />
          }
        </IconButton>
      </span>
    </Tooltip>
  );
}