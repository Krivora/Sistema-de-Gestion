import pool from "../config/db.js";

export async function findAll(clientId) {
  const { rows } = await pool.query(
    `SELECT * FROM suppliers WHERE client_id = $1 ORDER BY id ASC`,
    [clientId]
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT * FROM suppliers WHERE id = $1 AND client_id = $2`,
    [id, clientId]
  );
  return rows[0];
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO suppliers (client_id, name, phone, email, address)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [data.client_id, data.name, data.phone, data.email, data.address]
  );
  return rows[0];
}

export async function update(id, clientId, data) {
  const { rows } = await pool.query(
    `UPDATE suppliers
     SET name = $1, phone = $2, email = $3, address = $4, updated_at = NOW()
     WHERE id = $5 AND client_id = $6
     RETURNING *`,
    [data.name, data.phone, data.email, data.address, id, clientId]
  );
  return rows[0];
}

export async function deactivate(id, clientId) {
  const { rows } = await pool.query(
    `UPDATE suppliers
     SET is_active = FALSE
     WHERE id = $1 AND client_id = $2
     RETURNING *`,
    [id, clientId]
  );
  return rows[0];
}
