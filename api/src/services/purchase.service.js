import pool from "../config/db.js";
import * as PurchaseRepo from "../repositories/purchase.repository.js";
import * as TxRepo from "../repositories/inventoryTransaction.repository.js";
import * as BranchProductsRepo from "../repositories/branchProduct.repository.js";


// 🔹 Listar todas las compras
export async function listPurchases() {
  return await PurchaseRepo.findAll();
}

// 🔹 Obtener una compra con sus ítems
export async function getPurchase(id) {
  const purchase = await PurchaseRepo.findById(id);
  if (!purchase) return null;
  const items = await PurchaseRepo.findItems(id);
  return { ...purchase, items };
}

export async function createPurchase(data) {
  const {branch_id, doc_no, items } = data;

  // Crear encabezado
  const purchase = await PurchaseRepo.createPurchase({branch_id, doc_no });

  // Insertar ítems
  for (const item of items) {
    await PurchaseRepo.addItem(purchase.id, item);

    // Crear movimiento en el Kardex
    await TxRepo.create({
      branch_id,
      product_id: item.product_id,
      type: "PURCHASE",
      qty: item.qty,
      unit_cost: item.unit_cost,
      note: `Compra ${purchase.doc_no}`,
      ref_type: "purchase",
      ref_id: purchase.id,
    });

    // ✅ Crear o actualizar producto-sucursal y sumar stock
    await BranchProductsRepo.upsertStock(branch_id, item.product_id, item.qty, item.unit_cost);
  }

  return await getPurchase(purchase.id);
}
// 🔹 Eliminar compra (y movimientos asociados)
export async function removePurchase(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await TxRepo.removeByRef("purchase", id, client);
    const removed = await PurchaseRepo.removePurchase(id, client);

    await client.query("COMMIT");
    return removed;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
