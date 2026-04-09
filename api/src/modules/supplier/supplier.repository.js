import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = ["name", "phone", "email", "address"];

export async function findAll(clientId) {
  const { rows } = await pool.query(
    `SELECT id, name, phone, email, address, is_active, created_at
     FROM suppliers WHERE client_id=$1 ORDER BY name ASC`,
    [clientId]
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT id, name, phone, email, address, is_active, created_at
     FROM suppliers WHERE id=$1 AND client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function create({ client_id, name, phone, email, address }) {
  const { rows } = await pool.query(
    `INSERT INTO suppliers (client_id, name, phone, email, address)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [client_id, name, phone ?? null, email ?? null, address ?? null]
  );
  return rows[0];
}

export async function update(id, clientId, data) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  if (!Object.keys(filtered).length) return null;

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE suppliers SET ${fields.join(", ")}, updated_at=NOW()
     WHERE id=$${values.length + 1} AND client_id=$${values.length + 2}
     RETURNING *`,
    [...values, id, clientId]
  );
  return rows[0] ?? null;
}

export async function deactivate(id, clientId) {
  const { rows } = await pool.query(
    `UPDATE suppliers SET is_active=FALSE, updated_at=NOW()
     WHERE id=$1 AND client_id=$2 RETURNING *`,
    [id, clientId]
  );
  return rows[0] ?? null;
}