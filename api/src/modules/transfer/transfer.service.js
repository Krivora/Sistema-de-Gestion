import pool from "../../config/db.js";
import * as TransferRepo from "./transfer.repository.js";
import * as InventoryRepo from "../inventory/inventory.repository.js";
import { INVENTORY_TYPES } from "../../core/constants/inventoryTypes.js";
import { logAction } from "../../core/utils/audit.js";

export async function listTransfers(clientId, filters) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return TransferRepo.findAll(clientId, filters);
}

export async function getTransferById(id, clientId) {
  const header = await TransferRepo.findById(id, clientId);
  if (!header) return null;
  const items = await TransferRepo.findItems(id, clientId);
  return { ...header, items };
}

export async function createAndPostTransfer(payload, user, meta = {}) {
  const { from_branch_id, to_branch_id, note, items } = payload;
  const { client_id, id: user_id } = user;

  if (!from_branch_id || !to_branch_id) throw Object.assign(new Error("from_branch_id y to_branch_id son requeridos"), { status: 400 });
  if (Number(from_branch_id) === Number(to_branch_id)) throw Object.assign(new Error("No puedes transferir a la misma sucursal"), { status: 400 });
  if (!Array.isArray(items) || !items.length) throw Object.assign(new Error("Se requiere al menos un producto"), { status: 400 });

  for (const item of items) {
    if (!item.product_id) throw Object.assign(new Error("product_id requerido en cada item"), { status: 400 });
    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty <= 0) throw Object.assign(new Error(`Cantidad inválida en producto ${item.product_id}`), { status: 400 });
  }

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const transfer = await TransferRepo.createHeader(trx, {
      client_id, from_branch_id, to_branch_id, note, created_by: user_id,
    });

    const [fromProducts, toProducts] = await Promise.all([
      _getBranchProductMap(trx, from_branch_id, client_id),
      _getBranchProductMap(trx, to_branch_id, client_id),
    ]);

    for (const item of items) {
      const qty = Number(item.qty);
      const pid = Number(item.product_id);

      if (!fromProducts.has(pid)) throw Object.assign(
        new Error(`Producto ID ${pid} no asignado a sucursal origen`), { status: 400 }
      );
      if (!toProducts.has(pid)) throw Object.assign(
        new Error(`Producto ID ${pid} no asignado a sucursal destino`), { status: 400 }
      );

      await TransferRepo.addItem(trx, { transfer_id: transfer.id, product_id: pid, qty, client_id });

      await InventoryRepo.createAndApply(trx, {
        branch_id: from_branch_id, product_id: pid, qty,
        type: INVENTORY_TYPES.TRANSFER_OUT, unit_cost: 0,
        note: `Salida ${transfer.doc_no}`, ref_type: "transfers", ref_id: transfer.id,
      }, client_id, user_id);

      await InventoryRepo.createAndApply(trx, {
        branch_id: to_branch_id, product_id: pid, qty,
        type: INVENTORY_TYPES.TRANSFER_IN, unit_cost: 0,
        note: `Entrada ${transfer.doc_no}`, ref_type: "transfers", ref_id: transfer.id,
      }, client_id, user_id);
    }

    const posted = await TransferRepo.setPosted(trx, transfer.id, client_id);
    if (!posted) throw new Error("Error al publicar la transferencia");

    await trx.query("COMMIT");

    const itemsResp = await TransferRepo.findItems(posted.id, client_id);

    await logAction({
      ...meta, client_id, user_id,
      action: "CREATE_TRANSFER",
      description: `Transferencia ${posted.doc_no} creada con ${items.length} producto(s)`,
      ref_table: "transfers", ref_id: posted.id,
      new_data: { ...posted, items: itemsResp },
    });

    return { ...posted, items: itemsResp };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

async function _getBranchProductMap(trx, branchId, clientId) {
  const { rows } = await trx.query(
    `SELECT product_id FROM branch_products WHERE branch_id=$1 AND client_id=$2`,
    [branchId, clientId]
  );
  return new Map(rows.map((r) => [r.product_id, r]));
}