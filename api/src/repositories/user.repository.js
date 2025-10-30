import pool from "../config/db.js";

// 🧩 Listar todos los usuarios (para superadmin)
export async function findAllGlobal(status = "active") {
  let query = `
    SELECT 
      u.id, u.name, u.email, r.name AS role_name,
      u.branch_id, u.client_id, c.name AS client_name,
      u.dark_mode, u.status, u.created_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN clients c ON c.id = u.client_id
    WHERE 1=1
  `;

  if (status === "active") {
    query += " AND u.status = 'active'";
  } else if (status === "inactive") {
    query += " AND u.status = 'inactive'";
  } else if (status === "deleted") {
    query += " AND u.status = 'deleted'";
  }

  query += " ORDER BY u.id ASC";

  const { rows } = await pool.query(query);
  return rows;
}


// 🧩 Buscar por correo
export async function findByEmail(email) {
  const { rows } = await pool.query(`
    SELECT u.*, r.name AS role_name, r.id AS role_id
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.email = $1
  `, [email]);
  return rows[0];
}

// 🧩 Buscar por ID (cliente)
export async function findById(id, clientId) {
  const { rows } = await pool.query(`
    SELECT 
      u.id, u.name, u.email, r.name AS role_name,
      u.branch_id, u.dark_mode, u.status, u.created_at,
      c.id AS client_id, c.name AS client_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN clients c ON c.id = u.client_id
    WHERE u.id = $1 AND u.client_id = $2
  `, [id, clientId]);
  return rows[0];
}

// 🧩 Buscar por ID (sin client_id — superadmin)
export async function findByIdNoClient(id) {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.email, r.name AS role_name,
           u.branch_id, u.dark_mode, u.status, u.created_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `, [id]);
  return rows[0];
}

// 🧩 Crear usuario
export async function create({ name, email, password, role_id, branch_id, client_id }) {
  const { rows } = await pool.query(`
    INSERT INTO users (name, email, password, role_id, branch_id, client_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, role_id, branch_id, client_id, status, dark_mode
  `, [name, email, password, role_id, branch_id, client_id]);
  return rows[0];
}

// 🧩 Actualizar usuario
export async function update(id, clientId, { name, email, role_id, branch_id }) {
  const { rows } = await pool.query(`
    UPDATE users
    SET name = $1, email = $2, role_id = $3, branch_id = $4, updated_at = NOW()
    WHERE id = $5 AND client_id = $6
    RETURNING id, name, email, role_id, branch_id, dark_mode, status
  `, [name, email, role_id, branch_id, id, clientId]);
  return rows[0];
}


// 🧩 Obtener todos los usuarios de un cliente
export async function findAll(clientId, status = "active") {
  let query = `
    SELECT 
      u.id, u.name, u.email, r.name AS role_name,
      u.branch_id, u.dark_mode, u.status, u.created_at, u.desactivated_at
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.client_id = $1
  `;
  const params = [clientId];

  if (status === "active") {
    query += " AND u.status = 'active'";
  } else if (status === "inactive") {
    query += " AND u.status = 'inactive'";
  } 
  query += " ORDER BY u.id ASC";

  const { rows } = await pool.query(query, params);
  return rows;
}

// 🧩 Activar / desactivar (soft delete)
export async function deactivate(id) {
  const { rows } = await pool.query(`
    UPDATE users
    SET status = 'inactive', desactivated_at = NOW()
    WHERE id = $1
    RETURNING id, name, email, status
  `, [id]);
  return rows[0];
}

export async function deleted(id) {
  const { rows } = await pool.query(`
    UPDATE users
    SET status = 'deleted', deleted_at  = NOW()
    WHERE id = $1
    RETURNING id, name, email, status
  `, [id]);
  return rows[0];
}

// 🧩 Cambiar dark mode
export async function updateDarkMode(userId, darkMode) {
  const { rows } = await pool.query(`
    UPDATE users 
    SET dark_mode = $1
    WHERE id = $2
    RETURNING id, name, email, dark_mode, status
  `, [darkMode, userId]);
  return rows[0];
}
