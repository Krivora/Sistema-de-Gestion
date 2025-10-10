import pool from "../config/db.js";

function getExecutor(client) {
  return client || pool;
}

// 🧾 Listar ventas
export async function findAll(client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(`
    SELECT s.*, b.name AS branch_name
    FROM sales s
    LEFT JOIN branches b ON b.id = s.branch_id
    ORDER BY s.created_at DESC
  `);
  return rows;
}

// 📄 Buscar venta por ID
export async function findById(id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(`
    SELECT s.*, b.name AS branch_name
    FROM sales s
    LEFT JOIN branches b ON b.id = s.branch_id
    WHERE s.id = $1
  `, [id]);
  return rows[0];
}

// 📦 Crear venta
export async function createSale({ branch_id, doc_no = null, status = "open" }, client = null) {
  const executor = getExecutor(client);
  // 📄 Generar folio automático si no se envía
  if (!doc_no) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    doc_no = `VT-${random}`;
  }

  const { rows } = await executor.query(
    `INSERT INTO sales (branch_id, doc_no, status)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [branch_id, doc_no, status]
  );
  return rows[0];
}

// 🧾 Agregar ítem
export async function addItem(sale_id, { product_id, qty, unit_price }, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(
    `INSERT INTO sale_items (sale_id, product_id, qty, unit_price)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [sale_id, product_id, qty, unit_price]
  );
  return rows[0];
}

// 🔍 Obtener ítems
export async function findItems(sale_id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(`
    SELECT i.*, p.name AS product_name
    FROM sale_items i
    JOIN products p ON p.id = i.product_id
    WHERE i.sale_id = $1
  `, [sale_id]);
  return rows;
}

// 🗑️ Eliminar venta
export async function removeSale(id, client = null) {
  const executor = getExecutor(client);
  await executor.query(`DELETE FROM sale_items WHERE sale_id=$1`, [id]);
  const { rows } = await executor.query(
    "DELETE FROM sales WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0];
}
