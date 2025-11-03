import Swal from "sweetalert2";
import { useTheme } from "../../context/ThemeProvider";

/**
 * Hook para usar SweetAlert2 con tema dinámico
 */
export function useAlert() {
  const { darkMode } = useTheme();

  const baseOptions = {
    reverseButtons: true,
    confirmButtonColor: "#960b2b",
    cancelButtonColor: darkMode ? "#555" : "#999",
    background: darkMode ? "#1e1e1e" : "#fff",
    color: darkMode ? "#f5f5f5" : "#111",
  };

  return {
    async confirm({ title, text, icon = "warning", confirmText = "Aceptar", cancelText = "Cancelar" }) {
      const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        ...baseOptions,
      });
      return result.isConfirmed;
    },

    success(msg) {
      Swal.fire({
        icon: "success",
        title: msg,
        timer: 2000,
        showConfirmButton: false,
        ...baseOptions,
      });
    },

    error(msg) {
      Swal.fire({
        icon: "error",
        title: msg,
        timer: 2000,
        showConfirmButton: false,
        ...baseOptions,
      });
    },
  };
}
