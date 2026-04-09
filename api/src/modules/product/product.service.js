import * as ProductRepo from "./product.repository.js";

const isSuperAdmin = (role) => role === "superadmin";

export async function getAllProducts(clientId, roleName) {
  return ProductRepo.findAll(isSuperAdmin(roleName) ? null : clientId);
}

export async function getProductById(id, clientId, roleName) {
  return ProductRepo.findById(id, isSuperAdmin(roleName) ? null : clientId);
}

export async function createProduct(data, clientId, roleName) {
  const { sku, name, description, category_id, client_id } = data;
  if (!name) throw new Error("El nombre es requerido");

  return ProductRepo.create({
    sku: sku || null,
    name,
    description: description || null,
    category_id: category_id || null,
    client_id: isSuperAdmin(roleName) ? client_id : clientId,
  });
}

export async function updateProduct(id, data, clientId, roleName) {
  const targetClient = isSuperAdmin(roleName) ? data.client_id : clientId;
  const updated = await ProductRepo.update(id, targetClient, data);
  if (!updated) throw new Error("Producto no encontrado");
  return updated;
}

export async function activateProduct(id) {
  const p = await ProductRepo.activate(id);
  if (!p) throw new Error("Producto no encontrado");
  return p;
}

export async function deactivateProduct(id) {
  const p = await ProductRepo.deactivate(id);
  if (!p) throw new Error("Producto no encontrado");
  return p;
}

export async function deleteProduct(id) {
  const p = await ProductRepo.softDelete(id);
  if (!p) throw new Error("Producto no encontrado");
  return p;
}