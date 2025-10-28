import { apiFetch } from "./client";

export const CategoriesApi = {
  // Listar todas las categorías
  list: () => apiFetch("/categories"),

  // Obtener una categoría por id
  get: (id) => apiFetch(`/categories/${id}`),

  // Crear categoría
  create: (payload) =>
    apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Actualizar categoría
  update: (id, payload) =>
    apiFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Eliminar categoría (borrado logico)
  remove: (id) =>
    apiFetch(`/categories/${id}/desactivate`, {
      method: "PUT",
    }),
};
