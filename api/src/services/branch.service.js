import * as BranchRepo from "../repositories/branch.repository.js";

// 📋 Listar todas las sucursales
export async function listBranches() {
  return await BranchRepo.findAll();
}

// 🔍 Obtener una sucursal por ID
export async function getBranch(id) {
  return await BranchRepo.findById(id);
}

// 🆕 Crear una nueva sucursal
export async function addBranch(data) {
  // La generación de code automático se hace en el repo
  return await BranchRepo.create(data);
}

// ✏️ Editar una sucursal
export async function editBranch(id, data) {
  return await BranchRepo.update(id, data);
}

// 🔄 Cambiar estado (activar/desactivar)
export async function toggleBranchStatus(id, newStatus) {
  return await BranchRepo.toggleStatus(id, newStatus);
}

// 🗑️ Eliminar sucursal
export async function removeBranch(id) {
  return await BranchRepo.remove(id);
}
