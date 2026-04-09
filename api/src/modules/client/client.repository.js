import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = [
  "name", "business_name", "logo_url", "email",
  "phone", "max_users", "max_branches", "is_active"
];

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, code, name, business_name, logo_url,
            max_users, max_branches, email, phone, is_active, created_at
     FROM clients ORDER BY id ASC`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, code, name, business_name, logo_url,
            max_users, max_branches, email, phone, is_active, created_at
     FROM clients WHERE id=$1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ code, name, business_name, logo_url, email, phone, max_users, max_branches }, trxClient = null) {
  const db = trxClient ?? pool;
  const { rows } = await db.query(
    `INSERT INTO clients (code, name, business_name, logo_url, email, phone, max_users, max_branches)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [code, name, business_name ?? null, logo_url ?? null, email ?? null, phone ?? null, max_users ?? 5, max_branches ?? 1]
  );
  return rows[0];
}

export async function update(id, data) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  if (!Object.keys(filtered).length) return null;

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE clients SET ${fields.join(", ")}, updated_at=NOW()
     WHERE id=$${values.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] ?? null;
}

// Acción explícita — no toggle
export async function setActive(id, isActive) {
  const { rows } = await pool.query(
    `UPDATE clients SET is_active=$1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [isActive, id]
  );
  return rows[0] ?? null;
}

export async function findLastCode() {
  const { rows } = await pool.query(
    `SELECT code FROM clients WHERE code ILIKE 'CLI-%'
     ORDER BY id DESC LIMIT 1`
  );
  return rows[0]?.code ?? null;
}