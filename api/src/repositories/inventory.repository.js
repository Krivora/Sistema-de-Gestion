// src/repositories/inventory.repository.js
import pool from "../config/db.js";

/**
 * 🧾 Buscar transacciones (solo lectura, sin transacción)
 */
export async function findAll(clientId, filters = {}) {
  const conditions = ["it.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.branch_id) conditions.push(`it.branch_id = $${i++}`), params.push(filters.branch_id);
  if (filters.product_id) conditions.push(`it.product_id = $${i++}`), params.push(filters.product_id);
  if (filters.type) conditions.push(`it.type = $${i++}`), params.push(filters.type);
  if (filters.date_from) conditions.push(`it.created_at >= $${i++}`), params.push(filters.date_from);
  if (filters.date_to) conditions.push(`it.created_at < $${i++}`), params.push(filters.date_to);

  const query = `
    SELECT it.*, b.name AS branch_name, p.name AS product_name
    FROM inventory_transactions it
    JOIN branches b ON b.id = it.branch_id
    JOIN products p ON p.id = it.product_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY it.created_at DESC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}

/**
 * 🧩 Crear una transacción de inventario
 * (Debe llamarse siempre dentro de una transacción activa)
 */
export async function create(client, data) {
  const { rows } = await client.query(
    `INSERT INTO inventory_transactions
       (branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id, client_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.branch_id,
      data.product_id,
      data.type,
      data.qty,
      data.unit_cost ?? 0,
      data.note || null,
      data.ref_type || null,
      data.ref_id || null,
      data.client_id,
    ]
  );
  return rows[0];
}

/**
 * 🔎 Obtener stock actual (puede bloquear fila si se usa FOR UPDATE)
 */
export async function getBranchStock(client, branchId, productId, clientId, forUpdate = false) {
  const query = `
    SELECT stock FROM branch_products
    WHERE branch_id = $1 AND product_id = $2 AND client_id = $3
    ${forUpdate ? "FOR UPDATE" : ""}
  `;
  const { rows } = await client.query(query, [branchId, productId, clientId]);
  return Number(rows[0]?.stock ?? 0);
}

/**
 * 🔁 Actualizar stock en branch_products
 */
export async function updateBranchStock(client, branchId, productId, newStock, clientId) {
  await client.query(
    `UPDATE branch_products
     SET stock = $1, updated_at = NOW()
     WHERE branch_id = $2 AND product_id = $3 AND client_id = $4`,
    [newStock, branchId, productId, clientId]
  );
}

/**
 * 🧠 Validar que branch_product exista para el cliente
 */
export async function validateBranchProduct(client, branchId, productId, clientId) {
  const { rowCount } = await client.query(
    `SELECT 1 FROM branch_products WHERE branch_id = $1 AND product_id = $2 AND client_id = $3`,
    [branchId, productId, clientId]
  );
  if (!rowCount) throw new Error(`Producto ${productId} no configurado para la sucursal ${branchId}`);
}

/**
 * ⚙️ Aplica cambio de stock según tipo de movimiento
 *  - PURCHASE / ADJUSTMENT_IN / TRANSFER_IN → suma
 *  - SALE / ADJUSTMENT_OUT / TRANSFER_OUT → resta
 */
export async function applyStockChange(client, branchId, productId, qty, type, clientId) {
  const current = await getBranchStock(client, branchId, productId, clientId, true);
  console.log("Current stock:", current);
  let newStock = current;

  switch (type) {
    case "PURCHASE":
    case "ADJUSTMENT_IN":
    case "TRANSFER_IN":
      newStock += Number(qty);
      break;
    case "SALE":
    case "ADJUSTMENT_OUT":
    case "TRANSFER_OUT":
      if (current < qty) throw new Error(`Stock insuficiente para producto ${productId}`);
      newStock -= Number(qty);
      break;
    default:
      throw new Error(`Tipo de transacción inválido: ${type}`);
  }

  await updateBranchStock(client, branchId, productId, newStock, clientId);
  return newStock;
}

/**
 * 🪵 Registrar actividad (activity_logs)
 */
export async function logActivity(client, userId, clientId, action, description, refTable, refId) {
  await client.query(
    `INSERT INTO activity_logs (user_id, client_id, action, description, ref_table, ref_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, clientId, action, description, refTable, refId]
  );
}

/**
 * 🧮 Crear y aplicar una transacción completa de inventario
 * (debe llamarse siempre dentro de una transacción con client)
 */
export async function createAndApply(client, data, clientId, userId) {
  await validateBranchProduct(client, data.branch_id, data.product_id, clientId);

  const tx = await create(client, { ...data, client_id: clientId });
  const newStock = await applyStockChange(client, data.branch_id, data.product_id, data.qty, data.type, clientId);

  await logActivity(
    client,
    userId,
    clientId,
    `INVENTORY_${data.type}`,
    `${data.type} ${data.qty} unidades del producto ${data.product_id}`,
    "inventory_transactions",
    tx.id
  );

  return { ...tx, new_stock: newStock };
}
