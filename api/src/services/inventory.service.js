import * as InventoryRepo from "../repositories/inventory.repository.js";
import pool from "../config/db.js";

/**
 * 🔁 Ajustar stock automáticamente según tipo de movimiento
 */
async function applyStockChange(branch_id, product_id, qty, type) {
  const currentStock = await InventoryRepo.getBranchStock(branch_id, product_id);
  let newStock = currentStock;

  switch (type) {
    case "PURCHASE":
    case "ADJUSTMENT_IN":
    case "TRANSFER_IN":
      newStock += Number(qty);
      break;

    case "SALE":
    case "ADJUSTMENT_OUT":
    case "TRANSFER_OUT":
      newStock -= Number(qty);
      break;
  }

  await InventoryRepo.updateBranchStock(branch_id, product_id, newStock);
  return newStock;
}

/**
 * Crear transacción y actualizar stock
 */
export async function createTransaction(data, clientId) {
  // Validar que producto y sucursal pertenezcan al cliente
  const { rows: validation } = await pool.query(
    `SELECT 1 FROM branch_products WHERE branch_id = $1 AND product_id = $2 AND client_id = $3`,
    [data.branch_id, data.product_id, clientId]
  );
  if (!validation.length) throw new Error("Producto o sucursal no pertenecen al cliente");

  // Crear transacción
  const tx = await InventoryRepo.create({ ...data, client_id: clientId });

  // Aplicar cambio de stock
  const newStock = await applyStockChange(data.branch_id, data.product_id, data.qty, data.type);

  return { ...tx, new_stock: newStock };
}

/**
 * Listar transacciones
 */
export async function getTransactions(clientId, filters = {}) {
  return await InventoryRepo.findAll(clientId, filters);
}
