import * as BranchProductRepo from "./branchProduct.repository.js";
import { logAction } from "../../core/utils/audit.js";

const isSuperAdmin = (role) => role === "superadmin";

export async function listAllBranchProducts(clientId, role) {
  return BranchProductRepo.findAll(isSuperAdmin(role) ? null : clientId);
}

export async function listByBranch(branchId, clientId, role) {
  return BranchProductRepo.findByBranch(branchId, isSuperAdmin(role) ? null : clientId);
}

export async function getBranchProduct(id, clientId, role) {
  return BranchProductRepo.findById(id, isSuperAdmin(role) ? null : clientId);
}

export async function addBranchProduct(data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const { branch_id, product_id, price, cost, min_stock, reorder_point, currency } = data;
  if (!branch_id || !product_id) throw Object.assign(new Error("branch_id y product_id son requeridos"), { status: 400 });

  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;
  if (!targetClient) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  const record = await BranchProductRepo.create({ branch_id, product_id, price, cost, min_stock, reorder_point, currency, client_id: targetClient });

  await logAction({
    ...meta, client_id: targetClient, user_id,
    action: "CREATE_BRANCH_PRODUCT",
    description: `Producto ${product_id} asignado a sucursal ${branch_id}`,
    ref_table: "branch_products", ref_id: record.id,
    new_data: record,
  });

  return record;
}

export async function editBranchProduct(id, data, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const before = await BranchProductRepo.findById(id, client_id);
  const updated = await BranchProductRepo.update(id, data);
  if (!updated) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "UPDATE_BRANCH_PRODUCT",
    description: `Producto en sucursal (id:${id}) actualizado`,
    ref_table: "branch_products", ref_id: id,
    old_data: before, new_data: updated,
  });

  return updated;
}

export async function toggleBranchProductStatus(id, isActive, user, meta = {}) {
  const { client_id, id: user_id } = user;
  if (typeof isActive !== "boolean") throw Object.assign(new Error("is_active debe ser boolean"), { status: 400 });

  const updated = await BranchProductRepo.toggleStatus(id, isActive);
  if (!updated) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: isActive ? "ACTIVATE_BRANCH_PRODUCT" : "DEACTIVATE_BRANCH_PRODUCT",
    description: `Producto en sucursal (id:${id}) ${isActive ? "activado" : "desactivado"}`,
    ref_table: "branch_products", ref_id: id,
  });

  return updated;
}

export async function removeBranchProduct(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const deleted = await BranchProductRepo.remove(id);
  if (!deleted) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "DELETE_BRANCH_PRODUCT",
    description: `Producto en sucursal (id:${id}) eliminado`,
    ref_table: "branch_products", ref_id: id,
    old_data: deleted,
  });

  return deleted;
}