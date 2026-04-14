import * as ProductRepo from "./product.repository.js";
import { logAction } from "../../core/utils/audit.js";

const isSuperAdmin = (role) => role === "superadmin";

export async function getAllProducts(clientId, roleName) {
  return ProductRepo.findAll(isSuperAdmin(roleName) ? null : clientId);
}

export async function getProductById(id, clientId, roleName) {
  return ProductRepo.findById(id, isSuperAdmin(roleName) ? null : clientId);
}

export async function createProduct(data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const { sku, name, description, category_id, client_id } = data;
  if (!name) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });

  const record = await ProductRepo.create({
    sku: sku || null, name,
    description: description || null,
    category_id: category_id || null,
    client_id: isSuperAdmin(role) ? client_id : clientId,
  });

  await logAction({
    ...meta, client_id: record.client_id, user_id,
    action: "CREATE_PRODUCT",
    description: `Producto "${record.name}" creado`,
    ref_table: "products", ref_id: record.id,
    new_data: record,
  });

  return record;
}

export async function updateProduct(id, data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;

  const before = await ProductRepo.findById(id, targetClient);
  const updated = await ProductRepo.update(id, targetClient, data);
  if (!updated) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: targetClient, user_id,
    action: "UPDATE_PRODUCT",
    description: `Producto "${updated.name}" actualizado`,
    ref_table: "products", ref_id: id,
    old_data: before, new_data: updated,
  });

  return updated;
}

export async function activateProduct(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const p = await ProductRepo.activate(id);
  if (!p) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "ACTIVATE_PRODUCT",
    description: `Producto "${p.name}" activado`,
    ref_table: "products", ref_id: id,
  });

  return p;
}

export async function deactivateProduct(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const p = await ProductRepo.deactivate(id);
  if (!p) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "DEACTIVATE_PRODUCT",
    description: `Producto "${p.name}" desactivado`,
    ref_table: "products", ref_id: id,
    old_data: p,
  });

  return p;
}

export async function deleteProduct(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const p = await ProductRepo.softDelete(id);
  if (!p) throw Object.assign(new Error("Producto no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "DELETE_PRODUCT",
    description: `Producto "${p.name}" eliminado`,
    ref_table: "products", ref_id: id,
    old_data: p,
  });

  return p;
}