import * as BranchProductRepo from "../repositories/branchProduct.repository.js";

export async function listAllBranchProducts() {
  return await BranchProductRepo.findAll();
}

export async function listByBranch(branchId) {
  return await BranchProductRepo.findByBranch(branchId);
}

export async function getBranchProduct(id) {
  return await BranchProductRepo.findById(id);
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
