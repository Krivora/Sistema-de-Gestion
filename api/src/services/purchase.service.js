import pool from "../config/db.js";
import * as PurchaseRepo from "../repositories/purchase.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import { logAction } from "../utils/audit.js";

async function validateBranchAndProducts(client, client_id, branch_id, items) {
  const br = await client.query(
    `SELECT id FROM branches WHERE id = $1 AND client_id = $2`,
    [branch_id, client_id]
  );
  if (!br.rowCount) throw new Error("Sucursal inválida para este cliente");

  if (!items?.length) throw new Error("La compra requiere items");

  const productIds = items.map(i => Number(i.product_id));
  const { rows: prods } = await client.query(
    `SELECT id FROM products WHERE client_id = $1 AND id = ANY($2::int[])`,
    [client_id, productIds]
  );
  if (prods.length !== productIds.length) throw new Error("Uno o más productos no pertenecen al cliente");

  const { rows: bps } = await client.query(
    `SELECT product_id FROM branch_products WHERE client_id = $1 AND branch_id = $2 AND product_id = ANY($3::int[])`,
    [client_id, branch_id, productIds]
  );
  if (bps.length !== productIds.length) throw new Error("Falta configurar branch_products para algún producto");
}

export async function listPurchases(client_id, filters) {
  return await PurchaseRepo.findAll(client_id, filters);
}

export async function getPurchaseById(id, client_id) {
  const header = await PurchaseRepo.findById(id, client_id);
  if (!header) return null;
  const items = await PurchaseRepo.findItems(id, client_id);
  return { ...header, items };
}

// Crea y POSTEA la compra (afecta inventario)
export async function createAndPostPurchase(payload, user) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { client_id, id: user_id } = user;
    const { branch_id, items } = payload;

    await validateBranchAndProducts(client, client_id, branch_id, items);

    const purchase = await PurchaseRepo.createHeader(client, {
      ...payload,
      client_id,
      user_id
    });

    for (const it of items) {
      const qty = Number(it.qty);
      const unit_cost = Number(it.unit_cost);

      if (qty <= 0) throw new Error("Cantidad inválida en item");
      if (unit_cost < 0) throw new Error("Costo inválido en item");

      await PurchaseRepo.addItem(client, {
        purchase_id: purchase.id,
        product_id: it.product_id,
        qty,
        unit_cost,
        client_id
      });

      // Inventario: PURCHASE (entrada)
      await InventoryRepo.create({
        branch_id,
        product_id: it.product_id,
        type: "PURCHASE",
        qty,
        unit_cost,
        note: `Compra #${purchase.doc_no || purchase.id}`,
        ref_type: "purchase",
        ref_id: purchase.id,
        client_id
      });

      // Stock: sumar
      const { rows: cur } = await client.query(
        `SELECT stock FROM branch_products WHERE branch_id = $1 AND product_id = $2 AND client_id = $3 FOR UPDATE`,
        [branch_id, it.product_id, client_id]
      );
      const current = Number(cur[0]?.stock || 0);
      const next = current + qty;
      await client.query(
        `UPDATE branch_products SET stock = $1, updated_at = NOW()
         WHERE branch_id = $2 AND product_id = $3 AND client_id = $4`,
        [next, branch_id, it.product_id, client_id]
      );
    }

    const posted = await PurchaseRepo.setPosted(client, purchase.id, client_id);

    await logAction({
      client_id,
      user_id,
      action: "CREATE_PURCHASE",
      description: `Compra #${posted.doc_no || posted.id} creada y posteada`,
      ref_table: "purchases",
      ref_id: posted.id
    });

    await client.query("COMMIT");
    const itemsResp = await PurchaseRepo.findItems(purchase.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
