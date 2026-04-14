import pool from "../../config/db.js";
import * as PurchaseRepo from "./purchase.repository.js";
import * as InventoryRepo from "../inventory/inventory.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function listPurchases(clientId, filters) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return PurchaseRepo.findAll(clientId, filters);
}

export async function getPurchaseById(id, clientId) {
  const header = await PurchaseRepo.findById(id, clientId);
  if (!header) return null;
  const items = await PurchaseRepo.findItems(id, clientId);
  return { ...header, items };
}

export async function createAndPostPurchase(payload, user, meta = {}) {
  const { branch_id, items, supplier_id, doc_no } = payload;
  const { client_id, id: user_id } = user;

  if (!branch_id) throw Object.assign(new Error("branch_id requerido"), { status: 400 });
  if (!Array.isArray(items) || !items.length) throw Object.assign(new Error("Se requiere al menos un producto"), { status: 400 });

  for (const item of items) {
    if (!item.product_id) throw Object.assign(new Error("product_id requerido en cada item"), { status: 400 });
    const qty = Number(item.qty);
    const cost = Number(item.unit_cost);
    if (!Number.isFinite(qty) || qty <= 0) throw Object.assign(new Error(`Cantidad inválida en producto ${item.product_id}`), { status: 400 });
    if (!Number.isFinite(cost) || cost < 0) throw Object.assign(new Error(`Costo inválido en producto ${item.product_id}`), { status: 400 });
  }

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const purchase = await PurchaseRepo.createHeader(trx, {
      doc_no, branch_id, supplier_id, client_id, user_id,
    });

    for (const item of items) {
      const qty = Number(item.qty);
      const cost = Number(item.unit_cost);

      await PurchaseRepo.addItem(trx, {
        purchase_id: purchase.id,
        product_id: item.product_id,
        qty, unit_cost: cost, client_id,
      });

      await InventoryRepo.createAndApply(trx, {
        branch_id, product_id: item.product_id,
        qty, type: "PURCHASE", unit_cost: cost,
        note: `Compra ${purchase.doc_no}`,
        ref_type: "purchases", ref_id: purchase.id,
      }, client_id, user_id);

      await PurchaseRepo.updateAverageCost(trx, {
        branch_id, product_id: item.product_id,
        client_id, new_qty: qty, new_unit_cost: cost,
      });
    }

    const posted = await PurchaseRepo.setPosted(trx, purchase.id, client_id);
    if (!posted) throw new Error("Error al publicar la compra");

    await trx.query("COMMIT");

    const itemsResp = await PurchaseRepo.findItems(posted.id, client_id);

    await logAction({
      ...meta, client_id, user_id,
      action: "CREATE_PURCHASE",
      description: `Compra ${posted.doc_no} creada con ${items.length} producto(s)`,
      ref_table: "purchases", ref_id: posted.id,
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