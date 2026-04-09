import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = ["sku", "name", "description", "category_id"];

export async function findAll(clientId = null) {
  if (clientId) {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.client_id = $1 AND p.status IN ('active','inactive')
       ORDER BY p.status ASC, p.name ASC`,
      [clientId]
    );
    return rows;
  }

  const { rows } = await pool.query(
    `SELECT p.*, c.name AS category_name, cl.name AS client_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN clients cl ON cl.id = p.client_id
     WHERE p.status IN ('active','inactive')
     ORDER BY p.status ASC, p.name ASC`
  );
  return rows;
}

export async function findById(id, clientId = null) {
  const { rows } = await pool.query(
    `SELECT * FROM products
     WHERE id = $1 ${clientId ? "AND client_id = $2" : ""} AND status != 'deleted'`,
    clientId ? [id, clientId] : [id]
  );
  return rows[0] ?? null;
}

export async function create({ sku, name, description, category_id, client_id }) {
  let finalSku = sku;

  if (!finalSku) {
    let prefix = "GEN";
    if (category_id) {
      const { rows } = await pool.query("SELECT name FROM categories WHERE id = $1", [category_id]);
      if (rows[0]) {
        prefix = rows[0].name.trim().substring(0, 3).toUpperCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS total FROM products WHERE sku ILIKE $1",
      [`${prefix}-%`]
    );
    finalSku = `${prefix}-${String(rows[0].total + 1).padStart(4, "0")}`;
  }

  const { rows } = await pool.query(
    `INSERT INTO products (sku, name, description, category_id, client_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [finalSku, name, description, category_id, client_id]
  );
  return rows[0];
}

export async function update(id, clientId, data) {
  // Whitelist de campos — evita SQL injection por keys arbitrarias
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );

  if (Object.keys(filtered).length === 0) throw new Error("Sin campos válidos para actualizar");

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE products SET ${fields.join(", ")}, updated_at=NOW()
     WHERE id = $${values.length + 1} AND client_id = $${values.length + 2}
     RETURNING *`,
    [...values, id, clientId]
  );
  return rows[0] ?? null;
}

export async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE products
     SET status = $2,
         deleted_at = CASE WHEN $2 = 'deleted' THEN NOW() ELSE NULL END,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return rows[0] ?? null;
}

export const activate   = (id) => updateStatus(id, "active");
export const deactivate = (id) => updateStatus(id, "inactive");
export const softDelete = (id) => updateStatus(id, "deleted");