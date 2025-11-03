import * as CatalogRepo from "../repositories/catalog.repository.js";

/**
 * 📚 Listar catálogos disponibles del cliente
 */
export async function listCatalogs(clientId) {
  return await CatalogRepo.findAll(clientId);
}

/**
 * 📦 Listar items de un catálogo
 */
export async function listItems(clientId, code) {
  return await CatalogRepo.findItems(clientId, code);
}

/**
 * ➕ Crear nuevo item
 */
export async function createItem(clientId, code, data) {
  return await CatalogRepo.createItem(clientId, code, data);
}

/**
 * ✏️ Actualizar item
 */
export async function updateItem(id, data) {
  return await CatalogRepo.updateItem(id, data);
}

/**
 * 🚫 Soft delete
 */
export async function removeItem(id) {
  return await CatalogRepo.softDeleteItem(id);
}

/**
 * ♻️ Restaurar
 */
export async function restoreItem(id) {
  return await CatalogRepo.restoreItem(id);
}
