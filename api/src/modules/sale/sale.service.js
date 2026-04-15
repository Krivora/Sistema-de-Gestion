import pool from "../../config/db.js";
import * as SaleRepo from "./sale.repository.js";
import * as InventoryRepo from "../inventory/inventory.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function listSales(clientId, filters) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return SaleRepo.findAll(clientId, filters);
}

export async function getSaleById(id, clientId) {
  const header = await SaleRepo.findById(id, clientId);
  if (!header) return null;
  const items = await SaleRepo.findItems(id, clientId);
  return { ...header, items };
}

export async function createSale(payload, user, meta = {}) {
  const { branch_id, items, customer_id, customer_name, customer_phone, payment_method, doc_no, post = false } = payload;
  const { client_id, id: user_id } = user;

  if (!branch_id) throw Object.assign(new Error("branch_id requerido"), { status: 400 });
  if (!Array.isArray(items) || !items.length) throw Object.assign(new Error("Se requiere al menos un producto"), { status: 400 });

  for (const item of items) {
    if (!item.product_id) throw Object.assign(new Error("product_id requerido en cada item"), { status: 400 });
    const qty   = Number(item.qty);
    const price = Number(item.unit_price);
    if (!Number.isFinite(qty)   || qty   <= 0) throw Object.assign(new Error(`Cantidad inválida en producto ${item.product_id}`), { status: 400 });
    if (!Number.isFinite(price) || price <  0) throw Object.assign(new Error(`Precio inválido en producto ${item.product_id}`),   { status: 400 });
  }

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const sale = await SaleRepo.createHeader(trx, {
      doc_no, branch_id, client_id, user_id,
      customer_id, customer_name, customer_phone, payment_method,
    });

    for (const item of items) {
      const qty   = Number(item.qty);
      const price = Number(item.unit_price);

      await SaleRepo.addItem(trx, {
        sale_id: sale.id, product_id: item.product_id,
        qty, unit_price: price, client_id,
      });

      if (post) {
        await InventoryRepo.createAndApply(trx, {
          branch_id, product_id: item.product_id,
          qty, type: "SALE", unit_cost: price,
          note: `Venta ${sale.doc_no}`,
          ref_type: "sales", ref_id: sale.id,
        }, client_id, user_id);
      }
    }

    await SaleRepo.updateTotals(trx, sale.id, client_id);

    const final = post
      ? await SaleRepo.setPosted(trx, sale.id, client_id)
      : sale;

    if (!final) throw new Error("Error al procesar la venta");
    await trx.query("COMMIT");

    const itemsResp = await SaleRepo.findItems(final.id, client_id);

    await logAction({
      ...meta, client_id, user_id,
      action: post ? "CREATE_SALE" : "CREATE_SALE_OPEN",
      description: `Venta ${final.doc_no} creada (${post ? "posted" : "open"}) con ${items.length} producto(s)`,
      ref_table: "sales", ref_id: final.id,
      new_data: { ...final, items: itemsResp },
    });

    return { ...final, items: itemsResp };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

export async function postExistingSale(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const existing = await getSaleById(id, client_id);
  if (!existing) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (existing.status !== "open") throw Object.assign(new Error("Solo ventas open pueden publicarse"), { status: 400 });

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    for (const item of existing.items) {
      await InventoryRepo.createAndApply(trx, {
        branch_id: existing.branch_id, product_id: item.product_id,
        qty: item.qty, type: "SALE", unit_cost: item.unit_price,
        note: `Venta ${existing.doc_no}`,
        ref_type: "sales", ref_id: existing.id,
      }, client_id, user_id);
    }

    const posted = await SaleRepo.setPosted(trx, id, client_id);
    if (!posted) throw new Error("Error al publicar la venta");
    await trx.query("COMMIT");

    await logAction({
      ...meta, client_id, user_id,
      action: "POST_SALE",
      description: `Venta ${posted.doc_no} publicada`,
      ref_table: "sales", ref_id: posted.id,
      new_data: posted,
    });

    return { ...posted, items: existing.items };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

export async function reopenSale(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const existing = await getSaleById(id, client_id);
  if (!existing) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (existing.status !== "posted") throw Object.assign(new Error("Solo ventas posted pueden reabrirse"), { status: 400 });

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    // Revertir movimientos de inventario
    for (const item of existing.items) {
      await InventoryRepo.createAndApply(trx, {
        branch_id: existing.branch_id, product_id: item.product_id,
        qty: item.qty, type: "SALE_REVERT", unit_cost: item.unit_price,
        note: `Reversión venta ${existing.doc_no}`,
        ref_type: "sales", ref_id: existing.id,
      }, client_id, user_id);
    }

    const reopened = await SaleRepo.setOpen(trx, id, client_id);
    if (!reopened) throw new Error("Error al reabrir la venta");
    await trx.query("COMMIT");

    await logAction({
      ...meta, client_id, user_id,
      action: "REOPEN_SALE",
      description: `Venta ${reopened.doc_no} reabierta`,
      ref_table: "sales", ref_id: reopened.id,
      new_data: reopened,
    });

    return { ...reopened, items: existing.items };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}