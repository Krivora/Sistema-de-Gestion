import pool from "../config/db.js";

// 🧩 Listar productos
export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.client_id = $1
      ORDER BY p.id ASC
    `
    : `
      SELECT p.*, c.name AS category_name, cl.name AS client_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN clients cl ON cl.id = p.client_id
      ORDER BY p.id ASC
    `;
  const { rows } = await pool.query(query, clientId ? [clientId] : []);
  return rows;
}

// 🧩 Buscar por ID
export async function findById(id, clientId = null) {
  const query = clientId
    ? "SELECT * FROM products WHERE id = $1 AND client_id = $2"
    : "SELECT * FROM products WHERE id = $1";
  const { rows } = await pool.query(query, clientId ? [id, clientId] : [id]);
  return rows[0];
}

// 🧩 Crear producto
export async function create({ sku, name, description, category_id, client_id }) {
  const { rows } = await pool.query(
    `INSERT INTO products (sku, name, description, category_id, client_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sku, name, description, category_id, client_id]
  );
  return rows[0];
}

// 🧩 Actualizar
export async function update(id, clientId, data) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${i++}`);
    values.push(value);
  }
  const query = `
    UPDATE products
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${i} AND client_id = $${i + 1}
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [...values, id, clientId]);
  return rows[0];
}

// 🧩 Desactivar
export async function deactivate(id, clientId) {
  const { rows } = await pool.query(
    `UPDATE products SET is_active = FALSE WHERE id = $1 AND client_id = $2 RETURNING *`,
    [id, clientId]
  );
  return rows[0];
}
