import * as ProductRepo from "../repositories/product.repository.js";

export async function getAllProducts(clientId, roleName) {
  if (roleName === "superadmin") return await ProductRepo.findAll();
  return await ProductRepo.findAll(clientId);
}

export async function getProductById(id, clientId, roleName) {
  if (roleName === "superadmin") return await ProductRepo.findById(id);
  return await ProductRepo.findById(id, clientId);
}

export async function createProduct(data, clientId, roleName) {
  const targetClient = roleName === "superadmin" ? data.client_id : clientId;

  return await ProductRepo.create({
    sku: data.sku,
    name: data.name,
    description: data.description || null,
    category_id: data.category_id || null,
    client_id: targetClient,
  });
}

export async function updateProduct(id, data, clientId, roleName) {
  const targetClient = roleName === "superadmin" ? data.client_id : clientId;
  return await ProductRepo.update(id, targetClient, data);
}

export async function desactivateProduct(id) {
  return await ProductRepo.desactivate(id);
}
