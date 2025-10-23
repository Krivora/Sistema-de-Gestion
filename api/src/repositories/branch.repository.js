import pool from "../config/db.js";

// 🧩 Listar sucursales (global o por cliente)
export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT b.*, c.name AS client_name
      FROM branches b
      JOIN clients c ON c.id = b.client_id
      WHERE b.client_id = $1
      ORDER BY b.id ASC
    `
    : `
      SELECT b.*, c.name AS client_name
      FROM branches b
      JOIN clients c ON c.id = b.client_id
      ORDER BY b.id ASC
    `;
  const { rows } = await pool.query(query, clientId ? [clientId] : []);
  return rows;
}

// 🧩 Buscar por ID (validando client)
export async function findById(id, clientId = null) {
  const query = clientId
    ? "SELECT * FROM branches WHERE id = $1 AND client_id = $2"
    : "SELECT * FROM branches WHERE id = $1";
  const { rows } = await pool.query(query, clientId ? [id, clientId] : [id]);
  return rows[0];
}

// 🧩 Crear sucursal
export async function create({ code, name, address, phone, client_id }) {
  const { rows } = await pool.query(
    `INSERT INTO branches (code, name, address, phone, client_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [code, name, address, phone, client_id]
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
    UPDATE branches
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
    `UPDATE branches SET is_active = FALSE WHERE id = $1 AND client_id = $2 RETURNING *`,
    [id, clientId]
  );
  return rows[0];
}
