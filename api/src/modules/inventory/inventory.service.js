import pool from "../../config/db.js";
import * as InventoryRepo from "./inventory.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function getTransactions(clientId, filters = {}) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return InventoryRepo.findAll(clientId, filters);
}

export async function createTransaction(data, user, meta = {}) {
  const { client_id, id: user_id } = user;
  const { branch_id, product_id, type, qty } = data;

  if (!branch_id || !product_id || !type || !qty)
    throw Object.assign(new Error("branch_id, product_id, type y qty son requeridos"), { status: 400 });
  if (Number(qty) <= 0)
    throw Object.assign(new Error("qty debe ser mayor a 0"), { status: 400 });

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");
    const result = await InventoryRepo.createAndApply(trx, data, client_id, user_id);
    await trx.query("COMMIT");

    await logAction({
      ...meta, client_id, user_id,
      action: `INVENTORY_${type}`,
      description: `Movimiento ${type} — producto ${product_id}, sucursal ${branch_id}, qty: ${qty}`,
      ref_table: "inventory_transactions", ref_id: result.id,
      new_data: result,
    });

    return result;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}