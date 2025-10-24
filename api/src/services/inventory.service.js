import * as InventoryRepo from "../repositories/inventory.repository.js";
import pool from "../config/db.js";


export async function createTransaction(data, clientId, userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tx = await InventoryRepo.createAndApply(client, data, clientId, userId);

    await client.query("COMMIT");
    return tx;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getTransactions(clientId, filters = {}) {
  return await InventoryRepo.findAll(clientId, filters);
}
