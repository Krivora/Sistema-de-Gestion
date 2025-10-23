import * as TransferRepo from "../repositories/transfer.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import pool from "../config/db.js";

/**
 * Crear transferencia completa
 */
export async function createTransfer(data, user) {
  const { from_branch_id, to_branch_id, items, note } = data;
  const client_id = user.client_id;

  if (from_branch_id === to_branch_id)
    throw new Error("No puedes transferir a la misma sucursal");

  // Validar que ambas sucursales pertenezcan al cliente
  const { rows: branches } = await pool.query(
    `SELECT id FROM branches WHERE id IN ($1,$2) AND client_id = $3`,
    [from_branch_id, to_branch_id, client_id]
  );
  if (branches.length < 2) throw new Error("Sucursales inválidas para este cliente");

  // Crear transferencia
  const transfer = await TransferRepo.createTransfer({
    client_id,
    from_branch_id,
    to_branch_id,
    note,
    created_by: user.id,
  });

  // Procesar cada producto
  for (const item of items) {
    const { product_id, qty } = item;

    await TransferRepo.addItem(transfer.id, product_id, qty);

    // Registrar salida
    await InventoryRepo.create({
      branch_id: from_branch_id,
      product_id,
      type: "TRANSFER_OUT",
      qty,
      unit_cost: 0,
      note: `Salida transferencia #${transfer.id}`,
      client_id,
      ref_type: "transfer",
      ref_id: transfer.id,
    });

    // Registrar entrada
    await InventoryRepo.create({
      branch_id: to_branch_id,
      product_id,
      type: "TRANSFER_IN",
      qty,
      unit_cost: 0,
      note: `Entrada transferencia #${transfer.id}`,
      client_id,
      ref_type: "transfer",
      ref_id: transfer.id,
    });

    // Actualizar stock origen y destino
    const currentOut = await InventoryRepo.getBranchStock(from_branch_id, product_id);
    await InventoryRepo.updateBranchStock(from_branch_id, product_id, currentOut - Number(qty));

    const currentIn = await InventoryRepo.getBranchStock(to_branch_id, product_id);
    await InventoryRepo.updateBranchStock(to_branch_id, product_id, currentIn + Number(qty));
  }

  return transfer;
}

export async function getAllTransfers(clientId) {
  return await TransferRepo.findAll(clientId);
}

export async function getTransferById(id, clientId) {
  const transfer = await TransferRepo.findById(id, clientId);
  if (!transfer) return null;
  const items = await TransferRepo.findItems(transfer.id);
  return { ...transfer, items };
}
