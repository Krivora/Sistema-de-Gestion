import pool from "../config/db.js";

/**
 * 📚 Obtener todos los catálogos activos de un cliente
 */
export async function findAll(clientId) {
  const { rows } = await pool.query(
    `SELECT *
     FROM catalogs
     WHERE client_id = $1 AND deleted_at IS NULL
     ORDER BY name ASC`,
    [clientId]
  );
  return rows;
}

/**
 * 📦 Obtener items de un catálogo (por code)
 */
export async function findItems(clientId, code) {
  const { rows } = await pool.query(
    `SELECT 
        i.*, 
        u.name AS created_by_name
     FROM catalog_items i
     JOIN catalogs c ON c.id = i.catalog_id
     LEFT JOIN users u ON u.id = i.created_by  -- 👈 Une el usuario creador
     WHERE c.client_id = $1
       AND c.code = $2
     ORDER BY i.label ASC`,
    [clientId, code]
  );
  return rows;
}

/**
 * ➕ Crear un nuevo item dentro de un catálogo
 */
export async function createItem(clientId, code, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: catalogs } = await client.query(
      `SELECT id FROM catalogs WHERE client_id = $1 AND code = $2 AND deleted_at IS NULL`,
      [clientId, code]
    );
    if (!catalogs.length) throw new Error(`Catálogo '${code}' no encontrado para este cliente`);

    const catalogId = catalogs[0].id;

    const { label, value, metadata, created_by } = data;
    const { rows } = await client.query(
      `INSERT INTO catalog_items (catalog_id, label, value, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [catalogId, label, value || null, metadata || null, created_by || null]
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

/**
 * ✏️ Editar un item existente
 */
export async function updateItem(id, data) {
  const { label, value, metadata } = data;
  const { rows } = await pool.query(
    `UPDATE catalog_items
     SET label = $1,
         value = $2,
         metadata = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [label, value || null, metadata || null, id]
  );
  return rows[0];
}

/**
 * 🚫 Soft delete
 */
export async function softDeleteItem(id) {
  await pool.query(
    `UPDATE catalog_items SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [id]
  );
}

/**
 * ♻️ Restaurar
 */
export async function restoreItem(id) {
  await pool.query(
    `UPDATE catalog_items SET deleted_at = NULL, updated_at = NOW() WHERE id = $1`,
    [id]
  );
}
