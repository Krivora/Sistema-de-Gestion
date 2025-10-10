import pool from "../config/db.js";

export async function findAll() {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY id");
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0];
}

// ✅ Crear categoría (con código automático)
export async function create({ name, description, code, status = true }) {
  let finalCode = code;

  if (!finalCode) {
    const prefix = name
      .trim()
      .substring(0, 3)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM categories WHERE code ILIKE $1`,
      [`${prefix}%`]
    );
    const count = rows[0].total + 1;
    finalCode = `${prefix}-${String(count).padStart(3, "0")}`;
  }

  const { rows } = await pool.query(
    `INSERT INTO categories (name, description, code, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, finalCode, status]
  );

  return rows[0];
}

// ✅ Actualizar datos
export async function update(id, { name, description, code, status }) {
  const { rows } = await pool.query(
    `UPDATE categories
     SET name = $1,
         description = $2,
         code = $3,
         status = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name, description, code, status, id]
  );
  return rows[0];
}

// ✅ Inhabilitar (soft delete)
export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE categories
     SET status = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0];
}

// ✅ Habilitar
export async function activate(id) {
  const { rows } = await pool.query(
    `UPDATE categories
     SET status = TRUE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0];
}

// 🚫 Eliminación física (solo si realmente la necesitas)
export async function remove(id) {
  const { rows } = await pool.query(
    "DELETE FROM categories WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0];
}