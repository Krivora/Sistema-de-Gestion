import pool from "../../config/db.js";
import * as InventoryRepo from "./inventory.repository.js";

export async function getTransactions(clientId, filters = {}) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return InventoryRepo.findAll(clientId, filters);
}

export async function createTransaction(data, clientId, userId) {
  const { branch_id, product_id, type, qty } = data;
  if (!branch_id || !product_id || !type || !qty) {
    throw Object.assign(new Error("branch_id, product_id, type y qty son requeridos"), { status: 400 });
  }
  if (Number(qty) <= 0) throw Object.assign(new Error("qty debe ser mayor a 0"), { status: 400 });

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");
    const result = await InventoryRepo.createAndApply(trx, data, clientId, userId);
    await trx.query("COMMIT");
    return result;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}