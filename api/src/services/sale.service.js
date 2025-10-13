import pool from "../config/db.js";
import * as SalesRepo from "../repositories/sale.repository.js";
import * as TxRepo from "../repositories/inventoryTransaction.repository.js";
import * as BranchProductsRepo from "../repositories/branchProduct.repository.js";

// 🔹 Listar todas las ventas
export async function listSales() {
  return await SalesRepo.findAll();
}

// 🔹 Obtener una venta con ítems
export async function getSale(id) {
  const sale = await SalesRepo.findById(id);
  if (!sale) return null;
  const items = await SalesRepo.findItems(id);
  return { ...sale, items };
}

// 🔹 Crear venta (con movimientos y actualización de stock)
export async function createSale(data) {
  const {
    branch_id,
    doc_no,
    customer_name,
    customer_phone,
    payment_method,
    subtotal,
    total,
    items,
  } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ Ahora pasamos todos los campos al repository
    const sale = await SalesRepo.createSale(
      {
        branch_id,
        doc_no,
        customer_name,
        customer_phone,
        payment_method,
        subtotal,
        total,
      },
      client
    );

    // 🔹 Insertar ítems y movimientos de inventario
    for (const item of items) {
      await SalesRepo.addItem(sale.id, item, client);

      // 🧾 Movimiento de salida
      await TxRepo.create(
        {
          branch_id,
          product_id: item.product_id,
          type: "SALE",
          qty: item.qty,
          unit_cost: item.unit_price,
          note: `Venta ${sale.doc_no}`,
          ref_type: "sale",
          ref_id: sale.id,
        },
        client
      );

      // 📉 Restar stock
      await BranchProductsRepo.upsertStock(
        branch_id,
        item.product_id,
        -item.qty,
        item.unit_price
      );
    }

    await client.query("COMMIT");
    return await getSale(sale.id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// 🔹 Eliminar venta (y movimientos asociados)
export async function removeSale(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await TxRepo.removeByRef("sale", id, client);
    const removed = await SalesRepo.removeSale(id, client);
    await client.query("COMMIT");
    return removed;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
