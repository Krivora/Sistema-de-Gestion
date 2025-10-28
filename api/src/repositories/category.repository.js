import pool from "../config/db.js";

// 📋 Listar todas las categorías (opcionalmente filtradas por cliente)
export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.client_id = $1
        AND c.is_active = TRUE         -- 👈 solo categorías activas
      ORDER BY c.name ASC
    `
    : `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.is_active = TRUE         -- 👈 solo categorías activas
      ORDER BY c.name ASC
    `;

  const { rows } = await pool.query(query, clientId ? [clientId] : []);
  return rows;
}

// 🔍 Buscar categoría por ID (solo si está activa)
export async function findById(id, clientId = null) {
  const query = clientId
    ? `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.id = $1
        AND c.client_id = $2
        AND c.is_active = TRUE         -- 👈 solo activas
    `
    : `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.id = $1
        AND c.is_active = TRUE         -- 👈 solo activas
    `;

  const { rows } = await pool.query(query, clientId ? [id, clientId] : [id]);
  return rows[0];
}

// ✅ Crear categoría (con código automático y validación de activas)
export async function create({ name, description, code, client_id }) {
  try {
    // 🔍 1. Validar si ya existe una categoría ACTIVA con el mismo nombre para este cliente
    const { rows: existing } = await pool.query(
      `
      SELECT id
      FROM categories
      WHERE client_id = $1
        AND name ILIKE $2
        AND is_active = TRUE
      `,
      [client_id, name]
    );

    if (existing.length > 0) {
      const error = new Error("Ya existe una categoría activa con ese nombre.");
      error.status = 400;
      throw error;
    }

    // ⚙️ 2. Generar código automático si no se envió
    let finalCode = code;
    if (!finalCode) {
      const prefix = name
        .trim()
        .substring(0, 3)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // elimina acentos

      const { rows } = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM categories
        WHERE client_id = $1 AND code ILIKE $2
        `,
        [client_id, `${prefix}%`]
      );

      const count = rows[0].total + 1;
      finalCode = `${prefix}-${String(count).padStart(3, "0")}`;
    }

    // 🧾 3. Insertar nueva categoría
    const { rows } = await pool.query(
      `
      INSERT INTO categories (name, description, code, client_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, description, finalCode, client_id]
    );

    return rows[0];
  } catch (err) {
    // Si hay una violación de índice u otro error SQL
    if (err.code === "23505") {
      const error = new Error("Ya existe una categoría con ese nombre.");
      error.status = 400;
      throw error;
    }
    throw err;
  }
}



// ✅ Actualizar datos
export async function update(id, { name, description, code, is_active }) {
  const { rows } = await pool.query(
    `UPDATE categories
     SET name = $1,
         description = $2,
         code = $3,
         is_active = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name, description, code, is_active, id]
  );
  return rows[0];
}

// ✅ Inhabilitar (soft delete)
export async function desactivate(id) {
  const { rows } = await pool.query(
    `UPDATE categories
     SET is_active = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0];
}
