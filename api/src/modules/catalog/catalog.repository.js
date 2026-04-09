import pool from "../../config/db.js";

export async function findAll(clientId) {
  const { rows } = await pool.query(
    `SELECT id, code, name, description, created_at
     FROM catalogs
     WHERE client_id=$1 AND deleted_at IS NULL
     ORDER BY name ASC`,
    [clientId]
  );
  return rows;
}

export async function findItems(clientId, code) {
  const { rows } = await pool.query(
    `SELECT i.id, i.label, i.value, i.metadata, i.created_at, i.deleted_at,
            u.name AS created_by_name
     FROM catalog_items i
     JOIN catalogs c ON c.id = i.catalog_id
     LEFT JOIN users u ON u.id = i.created_by
     WHERE c.client_id=$1 AND c.code=$2 AND i.deleted_at IS NULL
     ORDER BY i.label ASC`,
    [clientId, code]
  );
  return rows;
}

export async function findCatalogByCode(clientId, code) {
  const { rows } = await pool.query(
    `SELECT id FROM catalogs WHERE client_id=$1 AND code=$2 AND deleted_at IS NULL`,
    [clientId, code]
  );
  return rows[0] ?? null;
}

export async function createItem(catalogId, { label, value, metadata, created_by }) {
  if (!label?.trim()) throw Object.assign(new Error("label es requerido"), { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO catalog_items (catalog_id, label, value, metadata, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [catalogId, label.trim(), value ?? null, metadata ?? null, created_by ?? null]
  );
  return rows[0];
}

export async function updateItem(id, clientId, { label, value, metadata }) {
  // Verificar que el item pertenece al cliente antes de actualizar
  const { rows: check } = await pool.query(
    `SELECT i.id FROM catalog_items i
     JOIN catalogs c ON c.id = i.catalog_id
     WHERE i.id=$1 AND c.client_id=$2 AND i.deleted_at IS NULL`,
    [id, clientId]
  );
  if (!check.length) throw Object.assign(new Error("Item no encontrado"), { status: 404 });

  const { rows } = await pool.query(
    `UPDATE catalog_items
     SET label=$1, value=$2, metadata=$3, updated_at=NOW()
     WHERE id=$4 RETURNING *`,
    [label, value ?? null, metadata ?? null, id]
  );
  return rows[0];
}

export async function softDeleteItem(id, clientId) {
  const { rows } = await pool.query(
    `UPDATE catalog_items SET deleted_at=NOW(), updated_at=NOW()
     WHERE id=$1
       AND catalog_id IN (SELECT id FROM catalogs WHERE client_id=$2)
     RETURNING id`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function restoreItem(id, clientId) {
  const { rows } = await pool.query(
    `UPDATE catalog_items SET deleted_at=NULL, updated_at=NOW()
     WHERE id=$1
       AND catalog_id IN (SELECT id FROM catalogs WHERE client_id=$2)
     RETURNING id`,
    [id, clientId]
  );
  return rows[0] ?? null;
}