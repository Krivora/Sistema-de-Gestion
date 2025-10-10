import * as CategoryRepo from "../repositories/category.repository.js";

export async function listCategories() {
  return await CategoryRepo.findAll();
}

export async function getCategory(id) {
  return await CategoryRepo.findById(id);
}

export async function addCategory(data) {
  return await CategoryRepo.create(data);
}

export async function editCategory(id, data) {
  return await CategoryRepo.update(id, data);
}

export async function deactivateCategory(id) {
  return await CategoryRepo.deactivate(id);
}

export async function activateCategory(id) {
  return await CategoryRepo.activate(id);
}

export async function removeCategory(id) {
  return await CategoryRepo.remove(id);
}
