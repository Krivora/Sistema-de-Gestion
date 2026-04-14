import pool from "../../config/db.js";

const VALID_STATUSES = ["active", "inactive", "deleted"];

const BASE_SELECT = `
  SELECT u.id, u.name, u.email, r.name AS role_name, r.id AS role_id,
        u.branch_id, u.dark_mode, u.status, u.created_at
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
`;

export async function findAllGlobal(status = null) {
  const params = [];
  const where = status && VALID_STATUSES.includes(status)
    ? (params.push(status), "WHERE u.status = $1")
    : "WHERE u.status != 'deleted'";

  const { rows } = await pool.query(
    `${BASE_SELECT} LEFT JOIN clients c ON c.id = u.client_id
     ${where} ORDER BY u.id ASC`,
    params
  );
  return rows;
}

export async function findAll(clientId, status = null) {
  const params = [clientId];
  let where = "WHERE u.client_id = $1";

  if (status && VALID_STATUSES.includes(status)) {
    params.push(status);
    where += ` AND u.status = $${params.length}`;
  } else {
    where += " AND u.status != 'deleted'";
  }

  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY u.id ASC`,
    params
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE u.id=$1 AND u.client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findByIdNoClient(id) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE u.id=$1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ name, email, password, role_id, branch_id, client_id }, trxClient = null) {
  const db = trxClient ?? pool;
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password, role_id, branch_id, client_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, name, email, role_id, branch_id, client_id, status, dark_mode`,
    [name, email, password, role_id, branch_id ?? null, client_id]
  );
  return rows[0];
}

export async function update(id, clientId, { name, email, role_id, branch_id }) {
  const { rows } = await pool.query(
    `UPDATE users SET name=$1, email=$2, role_id=$3, branch_id=$4, updated_at=NOW()
     WHERE id=$5 AND client_id=$6
     RETURNING id, name, email, role_id, branch_id, dark_mode, status`,
    [name, email, role_id, branch_id ?? null, id, clientId]
  );
  return rows[0] ?? null;
}

export async function activate(id) {
  const { rows } = await pool.query(
    `UPDATE users SET status='active', updated_at=NOW()
     WHERE id=$1 RETURNING id, name, email, status`,
    [id]
  );
  return rows[0] ?? null;
}

export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE users SET status='inactive', desactivated_at=NOW()
     WHERE id=$1 RETURNING id, name, email, status`,
    [id]
  );
  return rows[0] ?? null;
}

export async function softDelete(id) {
  const { rows } = await pool.query(
    `UPDATE users SET status='deleted', deleted_at=NOW()
     WHERE id=$1 RETURNING id, name, email, status`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateDarkMode(userId, darkMode) {
  const { rows } = await pool.query(
    `UPDATE users SET dark_mode=$1 WHERE id=$2
     RETURNING id, name, email, dark_mode, status`,
    [darkMode, userId]
  );
  return rows[0] ?? null;
}

export async function setStatusByClient(clientId, isActive) {
  await pool.query(
    `UPDATE users SET status=$1, updated_at=NOW() WHERE client_id=$2`,
    [isActive ? "active" : "inactive", clientId]
  );
}