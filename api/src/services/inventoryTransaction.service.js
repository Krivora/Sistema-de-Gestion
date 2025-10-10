import * as repo from "../repositories/inventoryTransaction.repository.js";
import * as BranchProductsRepo from "../repositories/branchProduct.repository.js";

/**
 * 📋 Listar movimientos
 */
export async function list(params) {
  return await repo.findAll(params);
}

/**
 * 🔍 Buscar movimiento por ID
 */
export async function getById(id) {
  return await repo.findById(id);
}

/**
 * ➕ Crear movimiento (entrada o salida)
 * Además actualiza el producto por sucursal (branch_products)
 */
export async function create(data) {
  const { branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id } = data;

  // 1️⃣ Crear movimiento
  const tx = await repo.create({
    branch_id,
    product_id,
    type,
    qty,
    unit_cost,
    note,
    ref_type,
    ref_id,
  });

  // 2️⃣ Determinar si es suma o resta según tipo
  const sumTypes = ["PURCHASE", "ADJUSTMENT_IN", "TRANSFER_IN"];
  const isAddition = sumTypes.includes(type);
  const qtySigned = isAddition ? qty : -qty;

  // 3️⃣ Crear o actualizar producto por sucursal
  await BranchProductsRepo.upsertStock(branch_id, product_id, qtySigned, unit_cost);

  return tx;
}

/**
 * 🗑️ Eliminar movimiento
 */
export async function remove(id) {
  return await repo.remove(id);
}

/**
 * 📦 Obtener stock actual por producto y sucursal
 */
export async function getStock(branch_id, product_id) {
  return await repo.getCurrentStock(branch_id, product_id);
}
