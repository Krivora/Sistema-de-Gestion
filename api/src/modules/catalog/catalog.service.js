import * as CatalogRepo from "./catalog.repository.js";

export async function listCatalogs(clientId) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return CatalogRepo.findAll(clientId);
}

export async function listItems(clientId, code) {
  if (!code?.trim()) throw Object.assign(new Error("code requerido"), { status: 400 });
  return CatalogRepo.findItems(clientId, code);
}

export async function createItem(clientId, code, data) {
  const catalog = await CatalogRepo.findCatalogByCode(clientId, code);
  if (!catalog) throw Object.assign(new Error(`Catálogo '${code}' no encontrado`), { status: 404 });
  return CatalogRepo.createItem(catalog.id, data);
}

export async function updateItem(id, clientId, data) {
  return CatalogRepo.updateItem(id, clientId, data);
}

export async function removeItem(id, clientId) {
  const deleted = await CatalogRepo.softDeleteItem(id, clientId);
  if (!deleted) throw Object.assign(new Error("Item no encontrado"), { status: 404 });
}

export async function restoreItem(id, clientId) {
  const restored = await CatalogRepo.restoreItem(id, clientId);
  if (!restored) throw Object.assign(new Error("Item no encontrado"), { status: 404 });
}