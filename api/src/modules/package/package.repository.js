import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = [
  "name", "description", "kind", "price", "item_count", "selection_scope", "category_id",
];

// El precio y el stock por sucursal NO viajan aquí: la pantalla de venta ya
// carga los branch_products de la sucursal y los cruza por product_id. Duplicar
// ese cálculo daría dos fuentes de verdad para el mismo número.
const ITEMS_JSON = `
  COALESCE((
    SELECT json_agg(json_build_object(
      'id',           pi.id,
      'product_id',   pi.product_id,
      'qty',          pi.qty::float8,
      'product_name', p.name,
      'sku',          p.sku,
      'product_status', p.status
    ) ORDER BY p.name)
    FROM package_items pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.package_id = pk.id
  ), '[]') AS items`;

const BASE_SELECT = `
  SELECT pk.id, pk.client_id, pk.code, pk.name, pk.description, pk.kind,
         pk.price::float8      AS price,
         pk.item_count::float8 AS item_count,
         pk.selection_scope, pk.category_id, pk.status,
         pk.created_at, pk.updated_at,
         c.name  AS category_name,
         cl.name AS client_name,
         ${ITEMS_JSON}
  FROM packages pk
  LEFT JOIN categories c ON c.id = pk.category_id
  LEFT JOIN clients   cl ON cl.id = pk.client_id`;

export async function findAll(clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     WHERE pk.status IN ('active','inactive')
       ${clientId ? "AND pk.client_id = $1" : ""}
     ORDER BY pk.status ASC, pk.name ASC`,
    clientId ? [clientId] : []
  );
  return rows;
}

export async function findById(id, clientId = null, db = pool) {
  const { rows } = await db.query(
    `${BASE_SELECT}
     WHERE pk.id = $1 AND pk.status <> 'deleted'
       ${clientId ? "AND pk.client_id = $2" : ""}`,
    clientId ? [id, clientId] : [id]
  );
  return rows[0] ?? null;
}

export async function create(trx, data) {
  let code = data.code?.trim();
  if (!code) {
    const { rows: seq } = await trx.query("SELECT nextval('packages_code_seq') AS seq");
    code = `PQ-${String(seq[0].seq).padStart(4, "0")}`;
  }

  const { rows } = await trx.query(
    `INSERT INTO packages
       (client_id, code, name, description, kind, price, item_count, selection_scope, category_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.client_id, code, data.name, data.description ?? null, data.kind,
      data.price ?? 0, data.item_count ?? null,
      data.selection_scope ?? "any", data.category_id ?? null,
    ]
  );
  return rows[0];
}

export async function update(trx, id, clientId, data) {
  // Whitelist de campos — evita SQL injection por keys arbitrarias
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  if (!Object.keys(filtered).length) return null;

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await trx.query(
    `UPDATE packages SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length + 1} AND client_id = $${values.length + 2}
       AND status <> 'deleted'
     RETURNING *`,
    [...values, id, clientId]
  );
  return rows[0] ?? null;
}

export async function replaceItems(trx, packageId, clientId, items = []) {
  await trx.query("DELETE FROM package_items WHERE package_id = $1", [packageId]);

  for (const item of items) {
    await trx.query(
      `INSERT INTO package_items (package_id, product_id, qty, client_id)
       VALUES ($1,$2,$3,$4)`,
      [packageId, item.product_id, item.qty ?? 1, clientId]
    );
  }
}

export async function updateStatus(id, clientId, status) {
  const { rows } = await pool.query(
    `UPDATE packages
        SET status     = $3::status_enum,
            deleted_at = CASE WHEN $3::status_enum = 'deleted' THEN NOW() ELSE NULL END,
            updated_at = NOW()
      WHERE id = $1 ${clientId ? "AND client_id = $2" : "AND $2::int IS NULL"}
      RETURNING *`,
    [id, clientId, status]
  );
  return rows[0] ?? null;
}

/**
 * Productos que un paquete acepta, ya resueltos según su alcance. Se usa al
 * vender para rechazar lo que no pertenece al paquete: si esto se validara solo
 * en el navegador, cualquiera podría armar un paquete de $200 con lo más caro.
 *
 * `null` = sin restricción (selection_scope 'any').
 */
export async function findAllowedProductIds(db, pkg) {
  if (pkg.selection_scope === "any") return null;

  if (pkg.selection_scope === "category") {
    if (!pkg.category_id) return null;
    const { rows } = await db.query(
      `SELECT id FROM products
        WHERE category_id = $1 AND client_id = $2 AND status = 'active'`,
      [pkg.category_id, pkg.client_id]
    );
    return new Set(rows.map((r) => r.id));
  }

  const { rows } = await db.query(
    "SELECT product_id FROM package_items WHERE package_id = $1",
    [pkg.id]
  );
  return new Set(rows.map((r) => r.product_id));
}

/** Productos válidos para el catálogo: activos y del mismo cliente. */
export async function findValidProductIds(db, productIds, clientId) {
  if (!productIds.length) return new Set();
  const { rows } = await db.query(
    `SELECT id FROM products
      WHERE id = ANY($1::int[]) AND client_id = $2 AND status = 'active'`,
    [productIds, clientId]
  );
  return new Set(rows.map((r) => r.id));
}

/** Cuántas ventas usan este paquete — para avisar antes de eliminarlo. */
export async function countUsages(id) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS total FROM sale_packages WHERE package_id = $1",
    [id]
  );
  return rows[0].total;
}
