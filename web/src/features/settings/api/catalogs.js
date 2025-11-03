import { apiFetch } from "@core/api/client";

export const CatalogsApi = {
  // 📚 Listar todos los catálogos del cliente
  list: () => apiFetch("/catalogs"),

  // 📦 Listar items de un catálogo (por code)
  listItems: (code) => apiFetch(`/catalogs/${code}/items`),

  // ➕ Crear nuevo item
  createItem: (code, payload) =>
    apiFetch(`/catalogs/${code}/items`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ✏️ Editar item
  updateItem: (id, payload) =>
    apiFetch(`/catalogs/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // 🚫 Soft delete
  deleteItem: (id) =>
    apiFetch(`/catalogs/items/${id}`, {
      method: "DELETE",
    }),

  // ♻️ Restaurar item
  restoreItem: (id) =>
    apiFetch(`/catalogs/items/${id}/restore`, {
      method: "PATCH",
    }),
};
