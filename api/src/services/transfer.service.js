import * as TransferRepo from "../repositories/transfer.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import pool from "../config/db.js";

/**
 * 🧩 Crear transferencia entre sucursales (manejo unificado de inventario)
 */
export async function createTransfer(data, user) {
  const { from_branch_id, to_branch_id, items, note } = data;
  const { client_id, id: user_id } = user;

  if (from_branch_id === to_branch_id)
    throw new Error("No puedes transferir a la misma sucursal");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (!items?.length) throw new Error("La transferencia requiere productos");

    // Crear encabezado
    const transfer = await TransferRepo.createTransfer({
      client_id,
      from_branch_id,
      to_branch_id,
      note,
      created_by: user_id,
    });

    // Procesar productos
    for (const item of items) {
      const qty = Number(item.qty);
      if (qty <= 0) throw new Error("Cantidad inválida en item");

      await TransferRepo.addItem(transfer.id, item.product_id, qty);

      // 🚚 Salida (TRANSFER_OUT)
      await InventoryRepo.createAndApply(
        client, // 🔹 ejecuta dentro de la misma transacción
        {
          branch_id: from_branch_id,
          product_id: item.product_id,
          qty,
          type: "TRANSFER_OUT",
          unit_cost: 0,
          note: `Salida transferencia #${transfer.id}`,
          ref_type: "transfers",
          ref_id: transfer.id,
        },
        client_id,
        user_id
      );

      // 🚚 Entrada (TRANSFER_IN)
      await InventoryRepo.createAndApply(
        client, // 🔹 también dentro de la misma transacción
        {
          branch_id: to_branch_id,
          product_id: item.product_id,
          qty,
          type: "TRANSFER_IN",
          unit_cost: 0,
          note: `Entrada transferencia #${transfer.id}`,
          ref_type: "transfers",
          ref_id: transfer.id,
        },
        client_id,
        user_id
      );
    }

    // Registrar log general
    await InventoryRepo.logActivity(
      client,
      user_id,
      client_id,
      "CREATE_TRANSFER",
      `Transferencia #${transfer.id} creada (${items.length} productos)`,
      "transfers",
      transfer.id
    );

    await client.query("COMMIT");
    return transfer;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 📋 Listar y obtener transferencias
 */
export async function getAllTransfers(clientId) {
  return await TransferRepo.findAll(clientId);
}

export async function getTransferById(id, clientId) {
  const transfer = await TransferRepo.findById(id, clientId);
  if (!transfer) return null;
  const items = await TransferRepo.findItems(transfer.id);
  return { ...transfer, items };
}
