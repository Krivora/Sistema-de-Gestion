import pool from "../config/db.js";

/**
 * 📋 Listar notas activas (no eliminadas)
 */
export async function findAll(clientId, type = null) {
  const params = [clientId];
  let query = `
    SELECT id, label, description, type, created_at, updated_at
    FROM adjustment_note_templates
    WHERE client_id = $1 AND deleted_at IS NULL
  `;
  if (type) {
    query += " AND (type = $2 OR type IS NULL)";
    params.push(type);
  }
  query += " ORDER BY label ASC";

  const { rows } = await pool.query(query, params);
  return rows;
}

/**
 * ➕ Crear nota nueva
 */
export async function create(clientId, data) {
  const { rows } = await pool.query(
    `INSERT INTO adjustment_note_templates (client_id, label, description, type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [clientId, data.label, data.description || null, data.type || null]
  );
  return rows[0];
}

/**
 * 🗑️ Soft delete
 */
export async function softDelete(clientId, id) {
  await pool.query(
    `UPDATE adjustment_note_templates
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND client_id = $2 AND deleted_at IS NULL`,
    [id, clientId]
  );
}

/**
 * 🔁 (opcional) Restaurar
 */
export async function restore(clientId, id) {
  await pool.query(
    `UPDATE adjustment_note_templates
     SET deleted_at = NULL, updated_at = NOW()
     WHERE id = $1 AND client_id = $2`,
    [id, clientId]
  );
}
