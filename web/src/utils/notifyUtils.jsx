import toast from "react-hot-toast";
import { CheckCircle, Error, Info, Warning } from "@mui/icons-material";
import { useTheme } from "../context/ThemeProvider";
import { motion } from "framer-motion";

/**
 * Hook personalizado para mostrar notificaciones visuales personalizadas.
 * Usa react-hot-toast.custom() con diseño adaptable al tema.
 */
export function useNotify() {
  const { darkMode } = useTheme();

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    color: darkMode ? "#f5f5f5" : "#111",
    background: darkMode ? "#1e1e1e" : "#fff",
    border: darkMode ? "1px solid #333" : "1px solid #ddd",
    fontWeight: 500,
  };

  const notify = (type, title, message) => {
    const icons = {
      success: <CheckCircle sx={{ color: "#4ade80" }} />,
      error: <Error sx={{ color: "#ef4444" }} />,
      info: <Info sx={{ color: "#3b82f6" }} />,
      warning: <Warning sx={{ color: "#f59e0b" }} />,
    };

    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            ...baseStyle,
            borderLeft: `4px solid ${
              {
                success: "#4ade80",
                error: "#ef4444",
                info: "#3b82f6",
                warning: "#f59e0b",
              }[type]
            }`,
          }}
          onClick={() => toast.dismiss(t.id)}
        >
          {icons[type]}
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm opacity-80">{message}</div>
          </div>
        </motion.div>
      ),
      {
        duration: 4000,
        position: "top-center",
      }
    );
  };

  return {
    success: (title, message) => notify("success", title, message),
    error: (title, message) => notify("error", title, message),
    info: (title, message) => notify("info", title, message),
    warning: (title, message) => notify("warning", title, message),
  };
}
