import pool from "../config/db.js";

// 🧩 Listar transacciones (por cliente)
export async function findAll(clientId, filters = {}) {
  const conditions = ["it.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.branch_id) {
    conditions.push(`it.branch_id = $${i++}`);
    params.push(filters.branch_id);
  }
  if (filters.product_id) {
    conditions.push(`it.product_id = $${i++}`);
    params.push(filters.product_id);
  }
  if (filters.type) {
    conditions.push(`it.type = $${i++}`);
    params.push(filters.type);
  }

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

// 🧩 Crear transacción
export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO inventory_transactions
     (branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id, client_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.branch_id,
      data.product_id,
      data.type,
      data.qty,
      data.unit_cost,
      data.note,
      data.ref_type || null,
      data.ref_id || null,
      data.client_id,
    ]
  );
  return rows[0];
}

// 🧩 Obtener stock actual
export async function getBranchStock(branchId, productId) {
  const { rows } = await pool.query(
    `SELECT stock FROM branch_products WHERE branch_id = $1 AND product_id = $2`,
    [branchId, productId]
  );
  return rows[0]?.stock ?? 0;
}

// 🧩 Actualizar stock
export async function updateBranchStock(branchId, productId, newStock) {
  await pool.query(
    `UPDATE branch_products
     SET stock = $1, updated_at = NOW()
     WHERE branch_id = $2 AND product_id = $3`,
    [newStock, branchId, productId]
  );
}
