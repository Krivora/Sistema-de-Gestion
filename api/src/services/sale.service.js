import pool from "../config/db.js";
import * as SaleRepo from "../repositories/sale.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";

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

    // Validar datos básicos
    if (!items?.length) throw new Error("La venta requiere productos");

    // Crear encabezado
    const sale = await SaleRepo.createHeader(client, {
      ...payload,
      client_id,
      user_id,
    });

    // Procesar cada item
    for (const item of items) {
      const qty = Number(item.qty);
      const price = Number(item.unit_price);
      if (qty <= 0) throw new Error("Cantidad inválida");
      if (price < 0) throw new Error("Precio inválido");

      // Insertar item
      await SaleRepo.addItem(client, {
        sale_id: sale.id,
        product_id: item.product_id,
        qty,
        unit_price: price,
        client_id,
      });

      // 🔁 Movimiento de inventario unificado
      await InventoryRepo.createAndApply(
        client,
        {
          branch_id,
          product_id: item.product_id,
          qty,
          type: "SALE",
          unit_cost: item.unit_price, // puedes registrar el precio de venta si quieres trazabilidad
          note: `Venta #${sale.doc_no || sale.id}`,
          ref_type: "sales",
          ref_id: sale.id,
        },
        client_id,
        user_id
      );
    }

    // Actualizar totales y publicar
    await SaleRepo.updateTotals(client, sale.id, client_id);
    const posted = await SaleRepo.setPosted(client, sale.id, client_id);

    // Log general
    await InventoryRepo.logActivity(
      client,
      user_id,
      client_id,
      "CREATE_SALE",
      `Venta #${posted.doc_no || posted.id} creada (${items.length} productos)`,
      "sales",
      posted.id
    );

    await client.query("COMMIT");
    const itemsResp = await SaleRepo.findItems(sale.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}