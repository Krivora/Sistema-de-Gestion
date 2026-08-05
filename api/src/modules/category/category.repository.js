import pool from "../../config/db.js";

const BASE_SELECT = `
  SELECT c.id, c.code, c.name, c.description, c.status, c.created_at,
         cl.name AS client_name
  FROM categories c
  JOIN clients cl ON cl.id = c.client_id
`;

export async function findAll(clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     WHERE c.status IN ('active','inactive')
     ${clientId ? "AND c.client_id = $1" : ""}
     ORDER BY c.status ASC, c.name ASC`,
    clientId ? [clientId] : []
  );
  return rows;
}

export async function findById(id, clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     WHERE c.id=$1 ${clientId ? "AND c.client_id=$2" : ""} AND c.status != 'deleted'`,
    clientId ? [id, clientId] : [id]
  );
  return rows[0] ?? null;
}

export async function create({ name, description, code, client_id }) {
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });
  if (!client_id) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  const { rows: existing } = await pool.query(
    `SELECT id FROM categories WHERE client_id=$1 AND name ILIKE $2 AND status='active'`,
    [client_id, name.trim()]
  );
  if (existing.length) throw Object.assign(new Error("Ya existe una categoría activa con ese nombre"), { status: 409 });

  let finalCode = code ?? null;
  if (!finalCode) {
    const prefix = name.trim().substring(0, 3).toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM categories WHERE client_id=$1 AND code ILIKE $2`,
      [client_id, `${prefix}%`]
    );
    finalCode = `${prefix}-${String(rows[0].total + 1).padStart(3, "0")}`;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, description, code, client_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [name.trim(), description ?? null, finalCode, client_id]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw Object.assign(new Error("Categoría duplicada"), { status: 409 });
    throw err;
  }
}

export async function update(id, clientId, { name, description }) {
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });

  // Verificar tenant antes de actualizar
  const { rows: check } = await pool.query(
    `SELECT id FROM categories WHERE id=$1 AND client_id=$2 AND status!='deleted'`,
    [id, clientId]
  );
  if (!check.length) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

  const { rows } = await pool.query(
    `UPDATE categories SET name=$1, description=$2, updated_at=NOW()
     WHERE id=$3 RETURNING *`,
    [name.trim(), description ?? null, id]
  );
  return rows[0] ?? null;
}

async function updateStatusCascade(id, clientId, status) {
  const VALID = ["active", "inactive", "deleted"];
  if (!VALID.includes(status)) throw Object.assign(new Error("Status inválido"), { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verificar tenant
    const { rows: check } = await client.query(
      `SELECT id FROM categories WHERE id=$1 AND client_id=$2`,
      [id, clientId]
    );
    if (!check.length) throw Object.assign(new Error("Categoría no encontrada"), { status: 404 });

    await client.query(
      `UPDATE products
   SET status = $2::status_enum,
       deleted_at = CASE WHEN $2::status_enum = 'deleted' THEN NOW() ELSE NULL END,
       updated_at = NOW()
   WHERE category_id = $1`,
      [id, status]
    );

    const { rows } = await client.query(
      `UPDATE categories
   SET status = $2::status_enum,
       deleted_at = CASE WHEN $2::status_enum = 'deleted' THEN NOW() ELSE NULL END,
       updated_at = NOW()
   WHERE id = $1
   RETURNING *`,
      [id, status]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}



export const activate = (id, clientId) => updateStatusCascade(id, clientId, "active");
export const deactivate = (id, clientId) => updateStatusCascade(id, clientId, "inactive");
export const softDelete = (id, clientId) => updateStatusCascade(id, clientId, "deleted");