import * as CategoryRepo from "../repositories/category.repository.js";

// 📋 Listar categorías (filtradas por cliente si aplica)
export async function listCategories(clientId, userRole) {
  if (userRole === "superadmin") {
    // 🔹 Superadmin ve todas las categorías
    return await CategoryRepo.findAll();
  }
  // 🔹 Clientes normales solo ven sus categorías
  return await CategoryRepo.findAll(clientId);
}

// 🔍 Obtener categoría por ID (validando cliente)
export async function getCategory(id, clientId, userRole) {
  if (userRole === "superadmin") {
    return await CategoryRepo.findById(id);
  }
  return await CategoryRepo.findById(id, clientId);
}

export async function addCategory(data) {
  return await CategoryRepo.create(data);
}

export async function editCategory(id, data) {
  return await CategoryRepo.update(id, data);
}

export async function activateCategory(id) {
  return await CategoryRepo.activate(id);
}

export async function desactivateCategory(id) {
  return await CategoryRepo.desactivate(id);
}

export async function deleteCategory(id) {
  return await CategoryRepo.deleted(id);
}