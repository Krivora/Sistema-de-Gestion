import pool from "../config/db.js";

// 🧩 Listar sucursales (global o por cliente)
export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT b.*, c.name AS client_name
      FROM branches b
      JOIN clients c ON c.id = b.client_id
      WHERE b.client_id = $1
        AND b.is_active = TRUE         -- 👈 Solo activas
      ORDER BY b.id ASC
    `
    : `
      SELECT b.*, c.name AS client_name
      FROM branches b
      JOIN clients c ON c.id = b.client_id
      WHERE b.is_active = TRUE         -- 👈 Solo activas
      ORDER BY b.id ASC
    `;

  const { rows } = await pool.query(query, clientId ? [clientId] : []);
  return rows;
}

// 🧩 Buscar por ID (validando client y activas)
export async function findById(id, clientId = null) {
  const query = clientId
    ? `
      SELECT *
      FROM branches
      WHERE id = $1
        AND client_id = $2
        AND is_active = TRUE           -- 👈 Solo activas
    `
    : `
      SELECT *
      FROM branches
      WHERE id = $1
        AND is_active = TRUE           -- 👈 Solo activas
    `;

  const { rows } = await pool.query(query, clientId ? [id, clientId] : [id]);
  return rows[0];
}

// 🧩 Crear sucursal (permitiendo duplicados si las previas están inactivas)
export async function create({ code, name, address, phone, client_id }) {
  // 1) Validar duplicados ACTIVOS por name
  const { rows: byName } = await pool.query(
    `
    SELECT id FROM branches
    WHERE client_id = $1
      AND name ILIKE $2
      AND is_active = TRUE
    `,
    [client_id, name]
  );
  if (byName.length > 0) {
    const e = new Error("Ya existe una sucursal activa con ese nombre.");
    e.status = 400;
    throw e;
  }

  // 2) Validar duplicados ACTIVOS por code (si viene de UI)
  if (code) {
    const { rows: byCode } = await pool.query(
      `
      SELECT id FROM branches
      WHERE client_id = $1
        AND code ILIKE $2
        AND is_active = TRUE
      `,
      [client_id, code]
    );
    if (byCode.length > 0) {
      const e = new Error("Ya existe una sucursal activa con ese código.");
      e.status = 400;
      throw e;
    }
  }

  // 3) Generar code si no viene (tu lógica actual)
  let finalCode = code;
  if (!finalCode) {
    const prefix = name
      .trim()
      .substring(0, 3)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const { rows } = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM branches
      WHERE client_id = $1
        AND code ILIKE $2
      `,
      [client_id, `${prefix}%`]
    );
    const count = rows[0].total + 1;
    finalCode = `${prefix}-${String(count).padStart(3, "0")}`;
  }

  // 4) Insert con manejo de unique_violation (por si hay carrera)
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO branches (code, name, address, phone, client_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [finalCode, name, address, phone, client_id]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") {
      // Mensaje amable según cuál índice pegó
      const msg =
        /name/i.test(err.detail || "") ?
          "Ya existe una sucursal activa con ese nombre." :
        /code/i.test(err.detail || "") ?
          "Ya existe una sucursal activa con ese código." :
          "Ya existe una sucursal activa con el mismo dato.";

      const e = new Error(msg);
      e.status = 400;
      throw e;
    }
    throw err;
  }
}

// 🧩 Actualizar
export async function update(id, clientId, data) {
  // Solo permitir columnas existentes
  const allowedFields = ["code", "name", "address", "phone", "is_active"];
  const fields = [];
  const values = [];

  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (!allowedFields.includes(key)) continue; // 🚫 Ignorar campos no válidos
    fields.push(`${key} = $${i++}`);
    values.push(value);
  }

  if (fields.length === 0) return null; // nada que actualizar

  const query = `
    UPDATE branches
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${i} AND client_id = $${i + 1}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [...values, id, clientId]);
  return rows[0];
}

// ✅ Inhabilitar (soft delete)
export async function desactivate(id) {
  const { rows } = await pool.query(
    `UPDATE branches
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0];
}

