import pool from "../config/db.js";

// 📋 Listar todos
export async function findAll() {
  const { rows } = await pool.query(`
    SELECT id, code, name, business_name, logo_url,
           max_users, max_branches, email, phone, is_active, created_at
    FROM clients
    ORDER BY id ASC
  `);
  return rows;
}

// 🔍 Buscar uno
export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM clients WHERE id = $1`,
    [id]
  );
  return rows[0];
}

// 🧩 Crear nuevo cliente
export async function create({
  code,
  name,
  business_name,
  logo_url,
  email,
  phone,
  max_users,
  max_branches,
}) {
  const { rows } = await pool.query(
    `INSERT INTO clients (
       code, name, business_name, logo_url, email, phone, max_users, max_branches
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [code, name, business_name, logo_url, email, phone, max_users, max_branches]
  );

  return rows[0];
}


// ✏️ Actualizar
export async function update(id, data) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${i++}`);
    values.push(value);
  }

  const query = `
    UPDATE clients SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${i}
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [...values, id]);
  return rows[0];
}

// 🚫 Desactivar
export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE clients SET is_active = FALSE WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
}

// 🔢 Obtener el último código
export async function findLastCode() {
  const { rows } = await pool.query(`
    SELECT code
    FROM clients
    WHERE code IS NOT NULL
    ORDER BY id DESC
    LIMIT 1
  `);
  return rows[0]?.code || null;
}
