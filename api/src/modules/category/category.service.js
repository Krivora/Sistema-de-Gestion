import * as CategoryRepo from "./category.repository.js";
import { logAction } from "../../core/utils/audit.js";

const isSuperAdmin = (role) => role === "superadmin";

export async function listCategories(clientId, role) {
  return CategoryRepo.findAll(isSuperAdmin(role) ? null : clientId);
}

export async function getCategory(id, clientId, role) {
  return CategoryRepo.findById(id, isSuperAdmin(role) ? null : clientId);
}

export async function addCategory(data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? (data.client_id ?? clientId) : clientId;

  const record = await CategoryRepo.create({ ...data, client_id: targetClient });

  await logAction({
    ...meta, client_id: targetClient, user_id,
    action: "CREATE_CATEGORY",
    description: `Categoría "${record.name}" creada`,
    ref_table: "categories", ref_id: record.id,
    new_data: record,
  });

  return record;
}

export async function editCategory(id, data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? (data.client_id ?? clientId) : clientId;

  const before = await CategoryRepo.findById(id, targetClient);
  if (!before) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  const updated = await CategoryRepo.update(id, targetClient, data);
  if (!updated) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  await logAction({
    ...meta, client_id: targetClient, user_id,
    action: "UPDATE_CATEGORY",
    description: `Categoría "${updated.name}" actualizada`,
    ref_table: "categories", ref_id: id,
    old_data: before, new_data: updated,
  });

  return updated;
}

export async function activateCategory(id, user, meta = {}) {
  const { client_id, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? null : client_id;

  const before = await CategoryRepo.findById(id, targetClient);
  if (!before) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  const record = await CategoryRepo.activate(id, targetClient);
  if (!record) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "ACTIVATE_CATEGORY",
    description: `Categoría "${record.name}" activada`,
    ref_table: "categories", ref_id: id,
    old_data: before, new_data: record,
  });

  return record;
}

export async function deactivateCategory(id, user, meta = {}) {
  const { client_id, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? null : client_id;

  const before = await CategoryRepo.findById(id, targetClient);
  if (!before) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  const record = await CategoryRepo.deactivate(id, targetClient);
  if (!record) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "DEACTIVATE_CATEGORY",
    description: `Categoría "${record.name}" desactivada`,
    ref_table: "categories", ref_id: id,
    old_data: before,
  });

  return record;
}

export async function deleteCategory(id, user, meta = {}) {
  const { client_id, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? null : client_id;

  const before = await CategoryRepo.findById(id, targetClient);
  if (!before) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  const deleted = await CategoryRepo.softDelete(id, targetClient);
  if (!deleted) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "DELETE_CATEGORY",
    description: `Categoría "${deleted.name}" eliminada`,
    ref_table: "categories", ref_id: id,
    old_data: before,
  });

  return deleted;
}