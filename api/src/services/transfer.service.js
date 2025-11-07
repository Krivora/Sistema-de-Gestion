import pool from "../config/db.js";
import * as TransferRepo from "../repositories/transfer.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import * as BranchProductRepo from "../repositories/branchProduct.repository.js";
import { INVENTORY_TYPES } from "../constants/inventoryTypes.js";

/**
 * 🧩 Crear y publicar una transferencia multiproducto
 * payload = { from_branch_id, to_branch_id, note, items: [{ product_id, qty }] }
 */
export async function createAndPostTransfer(payload, user) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { client_id, id: user_id } = user;
    const { from_branch_id, to_branch_id, note, items } = payload;

    if (!items?.length) throw new Error("La transferencia requiere productos");
    if (from_branch_id === to_branch_id)
      throw new Error("No puedes transferir a la misma sucursal");

    // 1️⃣ Crear encabezado
    const transfer = await TransferRepo.createHeader(client, {
      client_id,
      from_branch_id,
      to_branch_id,
      note,
      created_by: user_id,
    });

    // 🟡 Precargar productos por sucursal (solo 2 queries)
    const fromProducts = await BranchProductRepo.findByBranch(from_branch_id, client_id);
    const toProducts = await BranchProductRepo.findByBranch(to_branch_id, client_id);

    // 2️⃣ Procesar productos
    for (const item of items) {
      const qty = Number(item.qty);
      if (!item.product_id || qty <= 0)
        throw new Error("Producto o cantidad inválida");

      // 🔍 Buscar producto en origen
      const productFrom = fromProducts.find(
        (p) => p.product_id === Number(item.product_id)
      );
      if (!productFrom)
        throw new Error(
          `El producto (ID ${item.product_id}) no está asignado a la sucursal de origen.`
        );

      // 🔍 Buscar producto en destino
      const productTo = toProducts.find(
        (p) => p.product_id === Number(item.product_id)
      );
      if (!productTo)
        throw new Error(
          `El producto "${productFrom.product_name}" no está asignado a la sucursal destino.`
        );

      // Guardar item en tabla intermedia
      await TransferRepo.addItem(client, {
        transfer_id: transfer.id,
        product_id: item.product_id,
        qty,
        client_id,
      });

      // 🚚 Salida (TRANSFER_OUT)
      await InventoryRepo.createAndApply(
        client,
        {
          branch_id: from_branch_id,
          product_id: item.product_id,
          qty,
          type: INVENTORY_TYPES.TRANSFER_OUT,
          unit_cost: 0,
          note: `Salida ${transfer.doc_no}`,
          ref_type: "transfers",
          ref_id: transfer.id,
        },
        client_id,
        user_id
      );

      // 🚚 Entrada (TRANSFER_IN)
      await InventoryRepo.createAndApply(
        client,
        {
          branch_id: to_branch_id,
          product_id: item.product_id,
          qty,
          type: INVENTORY_TYPES.TRANSFER_IN,
          unit_cost: 0,
          note: `Entrada ${transfer.doc_no}`,
          ref_type: "transfers",
          ref_id: transfer.id,
        },
        client_id,
        user_id
      );
    }

    // 3️⃣ Publicar transferencia
    const posted = await TransferRepo.setPosted(client, transfer.id, client_id);

    // 4️⃣ Registrar log general
    await InventoryRepo.logActivity(
      client,
      user_id,
      client_id,
      "CREATE_TRANSFER",
      `Transferencia #${posted.id} creada con ${items.length} productos`,
      "transfers",
      posted.id
    );

    await client.query("COMMIT");

    const itemsResp = await TransferRepo.findItems(posted.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 📋 Listar transferencias
 */
export async function listTransfers(client_id, filters) {
  return await TransferRepo.findAll(client_id, filters);
}

/**
 * 🔍 Obtener transferencia con sus productos
 */
export async function getTransferById(id, client_id) {
  const header = await TransferRepo.findById(id, client_id);
  if (!header) return null;
  const items = await TransferRepo.findItems(id, client_id);
  return { ...header, items };
}
