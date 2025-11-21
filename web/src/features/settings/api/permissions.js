import { apiFetch } from "@core/api/client";

export const PermissionsApi = {
  // 📚 Listar todos los permisos del sistema
  list: () => apiFetch("/permissions"),
};
