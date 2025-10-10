import pool from "../config/db.js";

// ✅ Buscar por correo
export async function findByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0];
}

// ✅ Buscar por ID
export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, branch_id, dark_mode, is_active, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

// ✅ Crear usuario
export async function create({ name, email, password, role, branch_id }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, role, branch_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, branch_id, dark_mode, is_active`,
    [name, email, password, role, branch_id]
  );
  return rows[0];
}

// ✅ Actualizar datos generales
export async function update(id, { name, email, role, branch_id }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name = $1,
         email = $2,
         role = $3,
         branch_id = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, name, email, role, branch_id, dark_mode, is_active`,
    [name, email, role, branch_id, id]
  );
  return rows[0];
}

// ✅ Actualizar modo oscuro
export async function updateDarkMode(userId, darkMode) {
  const { rows } = await pool.query(
    `UPDATE users 
     SET dark_mode = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, role, branch_id, dark_mode, is_active`,
    [darkMode, userId]
  );
  return rows[0];
}

// ✅ Obtener todos los usuarios activos (por defecto)
export async function findAll({ includeInactive = false } = {}) {
  const query = includeInactive
    ? `SELECT id, name, email, role, branch_id, dark_mode, is_active, created_at
       FROM users
       ORDER BY id ASC`
    : `SELECT id, name, email, role, branch_id, dark_mode, is_active, created_at
       FROM users
       WHERE is_active = TRUE
       ORDER BY id ASC`;

  const { rows } = await pool.query(query);
  return rows;
}

// ✅ Soft delete → inhabilitar usuario
export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE users 
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, branch_id, dark_mode, is_active`,
    [id]
  );
  return rows[0];
}

// ✅ Rehabilitar usuario
export async function activate(id) {
  const { rows } = await pool.query(
    `UPDATE users 
     SET is_active = TRUE, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, branch_id, dark_mode, is_active`,
    [id]
  );
  return rows[0];
}

// 🚫 Eliminación real (solo si la necesitas)
export async function remove(id) {
  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return rowCount > 0;
}
