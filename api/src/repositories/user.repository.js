import pool from "../config/db.js";

// Buscar por correo
export async function findByEmail(email) {
  const { rows } = await pool.query(`
    SELECT u.*, r.name AS role_name, r.id AS role_id
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
  `, [email]);
  return rows[0];
}

// Buscar por ID (solo dentro del cliente)
export async function findById(id, clientId) {
  const { rows } = await pool.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      r.name AS role_name,
      u.branch_id,
      u.dark_mode,
      u.is_active,
      u.created_at,
      c.id AS client_id,
      c.name AS client_name,
      c.business_name,
      c.logo_url
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN clients c ON c.id = u.client_id
    WHERE u.id = $1 AND u.client_id = $2
  `, [id, clientId]);

  return rows[0];
}


// Crear usuario (cliente propietario)
export async function create({ name, email, password, role_id, branch_id, client_id }) {
  const { rows } = await pool.query(`
    INSERT INTO users (name, email, password, role_id, branch_id, client_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role_id, branch_id, client_id, is_active, dark_mode
  `, [name, email, password, role_id, branch_id, client_id]);
  return rows[0];
}

// Actualizar
export async function update(id, clientId, { name, email, role_id, branch_id }) {
  const { rows } = await pool.query(`
    UPDATE users
    SET name = $1, email = $2, role_id = $3, branch_id = $4, updated_at = NOW()
    WHERE id = $5 AND client_id = $6
    RETURNING id, name, email, role_id, branch_id, dark_mode, is_active
  `, [name, email, role_id, branch_id, id, clientId]);
  return rows[0];
}

// Obtener todos los usuarios del cliente
export async function findAll(clientId, { includeInactive = false } = {}) {
  const base = `
    SELECT u.id, u.name, u.email, r.name AS role_name, u.branch_id,
           u.dark_mode, u.is_active, u.created_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.client_id = $1
  `;
  const query = includeInactive ? `${base}` : `${base} AND u.is_active = TRUE`;
  const { rows } = await pool.query(query, [clientId]);
  return rows;
}

export async function updateDarkMode(userId, darkMode) {
  const { rows } = await pool.query(
    `UPDATE users 
     SET dark_mode = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, branch_id, dark_mode, is_active`,
    [darkMode, userId]
  );
  return rows[0];
}

// Buscar usuario sin client_id (superadmin)
export async function findByIdNoClient(id) {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.email, r.name AS role_name, u.branch_id,
           u.dark_mode, u.is_active, u.created_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `, [id]);
  return rows[0];
}

// Activar/desactivar todos los usuarios de un cliente
export async function toggleByClient(clientId, isActive) {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET is_active = $1, updated_at = NOW()
    WHERE client_id = $2
    RETURNING id, name, email, is_active;
    `,
    [isActive, clientId]
  );
  return rows;
}
