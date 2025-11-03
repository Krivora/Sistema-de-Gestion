import toast from "react-hot-toast";
import { createElement } from "react";
import { useTheme } from "../../context/ThemeProvider";

/**
 * Hook personalizado para usar toasts temáticos
 */
export function useToast() {
  const { darkMode } = useTheme();

  const baseStyle = {
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "0.95rem",
    background: darkMode ? "#1e1e1e" : "#fff",
    color: darkMode ? "#f5f5f5" : "#111",
    border: darkMode ? "1px solid #333" : "1px solid #ddd",
  };

  return {
    success: (msg) =>
      toast.success(msg, {
        style: baseStyle,
        iconTheme: {
          primary: "#4ade80",
          secondary: darkMode ? "#1e1e1e" : "#fff",
        },
      }),
    error: (msg) =>
      toast.error(msg, {
        style: baseStyle,
        iconTheme: {
          primary: "#ef4444",
          secondary: darkMode ? "#1e1e1e" : "#fff",
        },
      }),
    info: (msg) =>
      toast(msg, {
        style: baseStyle,
        icon: "💡",
      }),
  };
}
