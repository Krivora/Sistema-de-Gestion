import * as ProductRepo from "../repositories/product.repository.js";

export async function listProducts() {
  return await ProductRepo.findAll();
}

export async function getProduct(id) {
  return await ProductRepo.findById(id);
}

export async function addProduct(data) {
  return await ProductRepo.create(data);
}

export async function editProduct(id, data) {
  return await ProductRepo.update(id, data);
}

export async function removeProduct(id) {
  return await ProductRepo.remove(id);
}

export async function activateProduct(id) {
  return await ProductRepo.activate(id);
}

export async function deactivateProduct(id) {
  return await ProductRepo.deactivate(id);
}
