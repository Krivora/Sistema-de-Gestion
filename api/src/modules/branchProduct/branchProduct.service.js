import * as BranchProductRepo from "./branchProduct.repository.js";

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

export async function addBranchProduct(data, clientId, role) {
  const { branch_id, product_id, price, cost, min_stock, reorder_point, currency } = data;
  if (!branch_id || !product_id) throw Object.assign(new Error("branch_id y product_id son requeridos"), { status: 400 });

  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;
  if (!targetClient) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  return BranchProductRepo.create({ branch_id, product_id, price, cost, min_stock, reorder_point, currency, client_id: targetClient });
}

export async function editBranchProduct(id, data) {
  const updated = await BranchProductRepo.update(id, data);
  if (!updated) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });
  return updated;
}

export async function toggleBranchProductStatus(id, isActive) {
  if (typeof isActive !== "boolean") throw Object.assign(new Error("is_active debe ser boolean"), { status: 400 });
  const updated = await BranchProductRepo.toggleStatus(id, isActive);
  if (!updated) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });
  return updated;
}

export async function removeBranchProduct(id) {
  const deleted = await BranchProductRepo.remove(id);
  if (!deleted) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });
  return deleted;
}