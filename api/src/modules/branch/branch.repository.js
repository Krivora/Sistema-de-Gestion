import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = ["code", "name", "address", "phone", "is_active"];

const BASE_SELECT = `
  SELECT b.id, b.code, b.name, b.address, b.phone, b.is_active, b.created_at,
         c.name AS client_name
  FROM branches b
  JOIN clients c ON c.id = b.client_id
`;

export async function findAll(clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     WHERE b.is_active = TRUE ${clientId ? "AND b.client_id = $1" : ""}
     ORDER BY b.id ASC`,
    clientId ? [clientId] : []
  );
  return rows;
}

export async function findById(id, clientId = null) {
  const { rows } = await pool.query(
    `SELECT b.id, b.code, b.name, b.address, b.phone, b.is_active, b.created_at
     FROM branches b
     WHERE b.id = $1 ${clientId ? "AND b.client_id = $2" : ""} AND b.is_active = TRUE`,
    clientId ? [id, clientId] : [id]
  );
  return rows[0] ?? null;
}

export async function create({ code, name, address, phone, client_id }) {
  // Validar duplicados activos
  const { rows: byName } = await pool.query(
    `SELECT id FROM branches WHERE client_id=$1 AND name ILIKE $2 AND is_active=TRUE`,
    [client_id, name]
  );
  if (byName.length) throw Object.assign(new Error("Ya existe una sucursal activa con ese nombre"), { status: 409 });

  let finalCode = code;

  if (finalCode) {
    const { rows: byCode } = await pool.query(
      `SELECT id FROM branches WHERE client_id=$1 AND code ILIKE $2 AND is_active=TRUE`,
      [client_id, finalCode]
    );
    if (byCode.length) throw Object.assign(new Error("Ya existe una sucursal activa con ese código"), { status: 409 });
  } else {
    const prefix = name.trim().substring(0, 3).toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM branches WHERE client_id=$1 AND code ILIKE $2`,
      [client_id, `${prefix}%`]
    );
    finalCode = `${prefix}-${String(rows[0].total + 1).padStart(3, "0")}`;
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO branches (code, name, address, phone, client_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [finalCode, name, address ?? null, phone ?? null, client_id]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") {
      const msg = /name/i.test(err.detail ?? "") ? "Nombre duplicado"
                : /code/i.test(err.detail ?? "") ? "Código duplicado"
                : "Dato duplicado en sucursal";
      throw Object.assign(new Error(msg), { status: 409 });
    }
    throw err;
  }
}

export async function update(id, clientId, data) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  if (!Object.keys(filtered).length) return null;

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE branches SET ${fields.join(", ")}, updated_at=NOW()
     WHERE id=$${values.length + 1} AND client_id=$${values.length + 2}
     RETURNING *`,
    [...values, id, clientId]
  );
  return rows[0] ?? null;
}

export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE branches SET is_active=FALSE, updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [id]
  );
  return rows[0] ?? null;
}