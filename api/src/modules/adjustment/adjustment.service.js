import pool from "../../config/db.js";
import * as AdjustmentRepo from "./adjustment.repository.js";
import * as InventoryRepo from "../inventory/inventory.repository.js";

const VALID_TYPES = ["ADJUSTMENT_IN", "ADJUSTMENT_OUT"]; // ajusta a tu enum real

export async function createAndPostAdjustment(payload, user) {
  const { branch_id, note, items, type } = payload;
  const { client_id, id: user_id } = user;

  if (!branch_id) throw new Error("branch_id requerido");
  if (!VALID_TYPES.includes(type)) throw new Error("Tipo de ajuste inválido");
  if (!Array.isArray(items) || items.length === 0) throw new Error("El ajuste requiere al menos un producto");

  // Validar items antes de abrir transacción
  for (const item of items) {
    if (!item.product_id) throw new Error("product_id requerido en cada item");
    if (!Number.isFinite(Number(item.qty)) || Number(item.qty) <= 0)
      throw new Error(`Cantidad inválida para producto ${item.product_id}`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const adjustment = await AdjustmentRepo.createHeader(client, { branch_id, note, client_id, user_id, type });

    for (const item of items) {
      const qty = Number(item.qty);
      await AdjustmentRepo.addItem(client, {
        adjustment_id: adjustment.id,
        product_id: item.product_id,
        qty,
        note: item.note ?? null,
        client_id,
      });

      await InventoryRepo.createAndApply(client, {
        branch_id,
        product_id: item.product_id,
        qty,
        type,
        unit_cost: 0,
        note: `Ajuste ${adjustment.doc_no}`,
        ref_type: "adjustments",
        ref_id: adjustment.id,
      }, client_id, user_id);
    }

    const posted = await AdjustmentRepo.setPosted(client, adjustment.id, client_id);
    if (!posted) throw new Error("Error al publicar el ajuste");

    await InventoryRepo.logActivity(client, user_id, client_id,
      "CREATE_ADJUSTMENT",
      `Ajuste #${posted.id} creado con ${items.length} productos`,
      "adjustments", posted.id
    );

    await client.query("COMMIT");

    const itemsResp = await AdjustmentRepo.findItems(posted.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listAdjustments(clientId, filters) {
  if (!clientId) throw new Error("client_id requerido");
  return AdjustmentRepo.findAll(clientId, filters);
}

export async function getAdjustmentById(id, clientId) {
  const header = await AdjustmentRepo.findById(id, clientId);
  if (!header) return null;
  const items = await AdjustmentRepo.findItems(id, clientId);
  return { ...header, items };
}