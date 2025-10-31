import pool from "../config/db.js";

// 📋 Listar todas las categorías (opcionalmente filtradas por cliente)
export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.client_id = $1
        AND (c.status = 'active' OR c.status = 'inactive')
      ORDER BY c.status ASC, c.name ASC
    `
    : `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.status = 'active' OR c.status = 'inactive'
      ORDER BY c.status ASC, c.name ASC
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
        AND c.status = 'active'         -- 👈 solo activas
    `
    : `
      SELECT c.*, cl.name AS client_name
      FROM categories c
      JOIN clients cl ON cl.id = c.client_id
      WHERE c.id = $1
        AND c.status = 'active'         -- 👈 solo activas
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
        AND status = 'active'
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
export async function update(id, { name, description }) {
  const { rows } = await pool.query(
    `UPDATE categories
     SET name = $1,
         description = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [name, description, id]
  );
  return rows[0];
}

export async function updateCategoryAndProductsStatus(id, status) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Actualizar productos relacionados
    await client.query(
      `UPDATE products
       SET status = $2::status_enum,
           deleted_at = CASE WHEN $2 = 'deleted' THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE category_id = $1`,
      [id, status]
    );

    // 2️⃣ Actualizar la categoría
    const { rows } = await client.query(
      `UPDATE categories
       SET status = $2::status_enum,
           deleted_at = CASE WHEN $2 = 'deleted' THEN NOW() ELSE NULL END,
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

// Wrappers específicos
export async function activate(id) {
  return await updateCategoryAndProductsStatus(id, "active");
}

export async function desactivate(id) {
  return await updateCategoryAndProductsStatus(id, "inactive");
}

export async function deleted(id) {
  return await updateCategoryAndProductsStatus(id, "deleted");
}
