import pool from "../config/db.js";
import * as SaleRepo from "../repositories/sale.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import { logAction } from "../utils/audit.js";

// Helper: valida que branch y productos pertenezcan al cliente
async function validateBranchAndProducts(client, client_id, branch_id, items) {
  const br = await client.query(
    `SELECT id FROM branches WHERE id = $1 AND client_id = $2`,
    [branch_id, client_id]
  );
  if (!br.rowCount) throw new Error("Sucursal inválida para este cliente");

  if (!items?.length) throw new Error("La venta requiere items");

  // Valida productos y existencia en branch_products
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

export async function listSales(client_id, filters) {
  return await SaleRepo.findAll(client_id, filters);
}

export async function getSaleById(id, client_id) {
  const header = await SaleRepo.findById(id, client_id);
  if (!header) return null;
  const items = await SaleRepo.findItems(id, client_id);
  return { ...header, items };
}

// Crea y POSTEA la venta (afecta inventario)
export async function createAndPostSale(payload, user) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { client_id, id: user_id } = user;
    const { branch_id, items } = payload;

    // Validaciones
    await validateBranchAndProducts(client, client_id, branch_id, items);

    // Header
    const sale = await SaleRepo.createHeader(client, {
      ...payload,
      client_id,
      user_id
    });

    // Items
    for (const it of items) {
      const qty = Number(it.qty);
      const unit_price = Number(it.unit_price);

      if (qty <= 0) throw new Error("Cantidad inválida en item");
      if (unit_price < 0) throw new Error("Precio inválido en item");

      await SaleRepo.addItem(client, {
        sale_id: sale.id,
        product_id: it.product_id,
        qty,
        unit_price,
        client_id
      });

      // Inventario: SALE (salida)
      await InventoryRepo.create({
        branch_id,
        product_id: it.product_id,
        type: "SALE",
        qty,
        unit_cost: 0,
        note: `Venta #${sale.doc_no || sale.id}`,
        ref_type: "sale",
        ref_id: sale.id,
        client_id
      });

      // Stock: restar
      const { rows: cur } = await client.query(
        `SELECT stock FROM branch_products WHERE branch_id = $1 AND product_id = $2 AND client_id = $3 FOR UPDATE`,
        [branch_id, it.product_id, client_id]
      );
      const current = Number(cur[0]?.stock || 0);
      const next = current - qty;
      if (next < 0) {
        // si no quieres permitir negativos, descomenta:
        // throw new Error(`Stock insuficiente para product_id=${it.product_id}`);
      }
      await client.query(
        `UPDATE branch_products SET stock = $1, updated_at = NOW()
         WHERE branch_id = $2 AND product_id = $3 AND client_id = $4`,
        [next, branch_id, it.product_id, client_id]
      );
    }

    // Totales y posteo
    const updated = await SaleRepo.updateTotals(client, sale.id, client_id);
    const posted = await SaleRepo.setPosted(client, sale.id, client_id);

    await logAction({
      client_id,
      user_id,
      action: "CREATE_SALE",
      description: `Venta #${posted.doc_no || posted.id} creada y posteada`,
      ref_table: "sales",
      ref_id: posted.id
    });

    await client.query("COMMIT");
    const itemsResp = await SaleRepo.findItems(sale.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
