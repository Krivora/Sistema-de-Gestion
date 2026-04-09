import * as CategoryRepo from "./category.repository.js";

const isSuperAdmin = (role) => role === "superadmin";

export async function listCategories(clientId, role) {
  return CategoryRepo.findAll(isSuperAdmin(role) ? null : clientId);
}

export async function getCategory(id, clientId, role) {
  return CategoryRepo.findById(id, isSuperAdmin(role) ? null : clientId);
}

export async function addCategory(data, clientId, role) {
  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;
  return CategoryRepo.create({ ...data, client_id: targetClient });
}

export async function editCategory(id, clientId, role, data) {
  const targetClient = isSuperAdmin(role) ? data.client_id ?? clientId : clientId;
  return CategoryRepo.update(id, targetClient, data);
}

export async function activateCategory(id, clientId, role) {
  return CategoryRepo.activate(id, isSuperAdmin(role) ? null : clientId);
}

export async function deactivateCategory(id, clientId, role) {
  return CategoryRepo.deactivate(id, isSuperAdmin(role) ? null : clientId);
}

export async function deleteCategory(id, clientId, role) {
  return CategoryRepo.softDelete(id, isSuperAdmin(role) ? null : clientId);
}