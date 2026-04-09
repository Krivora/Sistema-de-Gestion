import pool from "../../config/db.js";
import * as SaleRepo from "./sale.repository.js";
import * as InventoryRepo from "../inventory/inventory.repository.js";

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

export async function createAndPostSale(payload, user) {
  const { branch_id, items, customer_id, customer_name, customer_phone, payment_method, doc_no } = payload;
  const { client_id, id: user_id } = user;

  if (!branch_id) throw Object.assign(new Error("branch_id requerido"), { status: 400 });
  if (!Array.isArray(items) || !items.length) throw Object.assign(new Error("Se requiere al menos un producto"), { status: 400 });

  // Validar items antes de abrir transacción
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

      await InventoryRepo.createAndApply(trx, {
        branch_id, product_id: item.product_id,
        qty, type: "SALE", unit_cost: price,
        note: `Venta ${sale.doc_no}`,
        ref_type: "sales", ref_id: sale.id,
      }, client_id, user_id);
    }

    await SaleRepo.updateTotals(trx, sale.id, client_id);
    const posted = await SaleRepo.setPosted(trx, sale.id, client_id);
    if (!posted) throw new Error("Error al publicar la venta");

    await InventoryRepo.logActivity(trx, user_id, client_id,
      "CREATE_SALE",
      `Venta ${posted.doc_no} creada (${items.length} productos)`,
      "sales", posted.id
    );

    await trx.query("COMMIT");
    const itemsResp = await SaleRepo.findItems(sale.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}