// src/repositories/role.repository.js
import pool from "../config/db.js";

// ⭐ Obtener todos los roles
export async function getAllRoles() {
  const { rows } = await pool.query(`SELECT * FROM roles ORDER BY id ASC`);
  return rows;
}

// ⭐ Obtener un rol con sus permisos
export async function getRoleWithPermissions(roleId) {
  const { rows } = await pool.query(
    `
    SELECT r.*, p.id AS permission_id, p.key AS permission_key
    FROM roles r
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE r.id = $1
    `,
    [roleId]
  );
  return rows;
}

// ⭐ Crear rol
export async function createRole({ name, description, level }) {
  const { rows } = await pool.query(
    `
    INSERT INTO roles (name, description, level)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, description, level]
  );
  return rows[0];
}

// ⭐ Actualizar rol
export async function updateRole(roleId, { name, description, level }) {
  const { rows } = await pool.query(
    `
    UPDATE roles
    SET name = $1, description = $2, level = $3
    WHERE id = $4
    RETURNING *
    `,
    [name, description, level, roleId]
  );
  return rows[0];
}

// ⭐ Eliminar rol
export async function deleteRole(roleId) {
  await pool.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
  const { rowCount } = await pool.query(`DELETE FROM roles WHERE id = $1`, [roleId]);
  return rowCount > 0;
}

// ⭐ Guardar permisos asignados
export async function assignPermissions(roleId, permissionIds) {
  await pool.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);

  if (permissionIds.length === 0) return;

  const values = permissionIds.map((p, i) => `($1, $${i + 2})`).join(",");
  const params = [roleId, ...permissionIds];

  await pool.query(
    `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
    params
  );
}
