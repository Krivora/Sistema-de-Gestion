import pool from "../../config/db.js";

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, key, description, created_at
     FROM permissions ORDER BY key ASC`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, key, description, created_at FROM permissions WHERE id=$1`,
    [id]
  );
  return rows[0] ?? null;
}

// Usado por permissions.middleware.js
export async function findKeysByRoleId(roleId) {
  const { rows } = await pool.query(
    `SELECT p.key FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = $1`,
    [roleId]
  );
  return rows.map((r) => r.key);
}