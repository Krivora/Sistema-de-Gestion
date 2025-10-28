import * as BranchProductRepo from "../repositories/branchProduct.repository.js";

export async function listAllBranchProducts(clientId, userRole) {
  // 🔸 Superadmin puede ver todos los clientes
  if (userRole === "superadmin") {
    return await BranchProductRepo.findAll();
  }
  // 🔹 Usuarios normales ven solo sus productos
  return await BranchProductRepo.findAll(clientId);
}

// 📍 Listar productos por sucursal
export async function listByBranch(branchId, clientId, userRole) {
  if (userRole === "superadmin") {
    return await BranchProductRepo.findByBranch(branchId);
  }
  return await BranchProductRepo.findByBranch(branchId, clientId);
}

// 🔍 Obtener producto de sucursal por ID
export async function getBranchProduct(id, clientId, userRole) {
  if (userRole === "superadmin") {
    return await BranchProductRepo.findById(id);
  }
  return await BranchProductRepo.findById(id, clientId);
}

export async function addBranchProduct(data) {
  return await BranchProductRepo.create(data);
}

export async function editBranchProduct(id, data) {
  return await BranchProductRepo.update(id, data);
}

export async function toggleBranchProductStatus(id, newStatus) {
  return await BranchProductRepo.toggleStatus(id, newStatus);
}

export async function removeBranchProduct(id) {
  return await BranchProductRepo.remove(id);
}
