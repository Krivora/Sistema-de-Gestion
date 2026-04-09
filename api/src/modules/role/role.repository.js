import pool from "../../config/db.js";

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, name, description, level, created_at FROM roles ORDER BY level ASC, name ASC`
  );
  return rows;
}

export async function findWithPermissions(roleId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.name, r.description, r.level,
            p.id AS permission_id, p.key AS permission_key
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE r.id = $1`,
    [roleId]
  );
  return rows;
}

export async function create({ name, description, level }) {
  const { rows } = await pool.query(
    `INSERT INTO roles (name, description, level)
     VALUES ($1,$2,$3) RETURNING id, name, description, level`,
    [name, description ?? null, level ?? 1]
  );
  return rows[0];
}

export async function update(roleId, { name, description, level }) {
  const { rows } = await pool.query(
    `UPDATE roles SET name=$1, description=$2, level=$3, updated_at=NOW()
     WHERE id=$4 RETURNING id, name, description, level`,
    [name, description ?? null, level ?? 1, roleId]
  );
  return rows[0] ?? null;
}

export async function remove(roleId) {
  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");
    await trx.query(`DELETE FROM role_permissions WHERE role_id=$1`, [roleId]);
    const { rowCount } = await trx.query(`DELETE FROM roles WHERE id=$1`, [roleId]);
    if (!rowCount) throw Object.assign(new Error("Rol no encontrado"), { status: 404 });
    await trx.query("COMMIT");
    return true;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

export async function assignPermissions(roleId, permissionIds) {
  // Verificar que todos los permission_ids existen antes de insertar
  if (permissionIds.length) {
    const { rows } = await pool.query(
      `SELECT id FROM permissions WHERE id = ANY($1::int[])`,
      [permissionIds]
    );
    if (rows.length !== permissionIds.length) {
      throw Object.assign(new Error("Uno o más permisos no existen"), { status: 400 });
    }
  }

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");
    await trx.query(`DELETE FROM role_permissions WHERE role_id=$1`, [roleId]);

    if (permissionIds.length) {
      // ANY($2::int[]) evita construir SQL dinámico con índices
      await trx.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, UNNEST($2::int[])`,
        [roleId, permissionIds]
      );
    }

    await trx.query("COMMIT");
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}