import pool from "../config/db.js";

function getExecutor(client) {
  return client || pool;
}

// 🧾 Listar compras
export async function findAll(client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(`
    SELECT p.* , b.name AS branch_name
    FROM purchases p
    LEFT JOIN branches b ON b.id = p.branch_id
    ORDER BY p.created_at DESC
  `);
  return rows;
}

// 📄 Buscar una compra
export async function findById(id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(`
    SELECT p.*, b.name AS branch_name
    FROM purchases p
    LEFT JOIN branches b ON b.id = p.branch_id
    WHERE p.id = $1
  `, [id]);
  return rows[0];
}

// 📦 Crear una compra (encabezado)
export async function createPurchase({branch_id, doc_no = null, status = "open" }, client = null) {
  const executor = getExecutor(client);
  // 🔹 Si no se proporciona doc_no, generar uno aleatorio
  if (!doc_no) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    doc_no = `CP-${random}`; // ejemplo: CP-A1B2C3
  }

  const { rows } = await executor.query(
    `INSERT INTO purchases (branch_id, doc_no, status)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [branch_id, doc_no, status]
  );

  return rows[0];
}


// 📦 Agregar ítem
export async function addItem(purchase_id, { product_id, qty, unit_cost }, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(
    `INSERT INTO purchase_items (purchase_id, product_id, qty, unit_cost)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [purchase_id, product_id, qty, unit_cost]
  );
  return rows[0];
}

// 🔍 Obtener ítems de una compra
export async function findItems(purchase_id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(`
    SELECT i.*, p.name AS product_name, p.sku
    FROM purchase_items i
    JOIN products p ON p.id = i.product_id
    WHERE i.purchase_id = $1
  `, [purchase_id]);
  return rows;
}

// 🗑️ Eliminar compra completa (sin movimientos)
export async function removePurchase(id, client = null) {
  const executor = getExecutor(client);
  await executor.query(`DELETE FROM purchase_items WHERE purchase_id=$1`, [id]);
  const { rows } = await executor.query(
    "DELETE FROM purchases WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0];
}
