import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = ["price", "cost", "min_stock", "reorder_point", "currency", "is_active"];

// Subquery de stock extraído — no repetir 3 veces
const STOCK_SUBQUERY = `
  COALESCE((
    SELECT SUM(CASE
      WHEN t.type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN t.qty
      WHEN t.type IN ('SALE','ADJUSTMENT_OUT','TRANSFER_OUT')   THEN -t.qty
      ELSE 0
    END)
    FROM inventory_transactions t
    WHERE t.product_id = bp.product_id
      AND t.branch_id  = bp.branch_id
      AND t.client_id  = bp.client_id
  ), 0) AS current_stock
`;

const BASE_SELECT = `
  SELECT bp.id, bp.branch_id, bp.product_id, bp.price, bp.cost,
         bp.min_stock, bp.reorder_point, bp.currency, bp.is_active,
         p.name AS product_name, p.sku, p.category_id,
         b.name AS branch_name,
         c.name AS client_name,
         ${STOCK_SUBQUERY}
  FROM branch_products bp
  JOIN products p ON p.id = bp.product_id
  JOIN branches b ON b.id = bp.branch_id
  JOIN clients  c ON c.id = bp.client_id
`;

export async function findAll(clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     ${clientId ? "WHERE bp.client_id = $1" : ""}
     ORDER BY ${clientId ? "b.name, p.name" : "c.name, b.name, p.name"}`,
    clientId ? [clientId] : []
  );
  return rows;
}

export async function findByBranch(branchId, clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     WHERE bp.branch_id = $1 ${clientId ? "AND bp.client_id = $2" : ""}
     ORDER BY p.name`,
    clientId ? [branchId, clientId] : [branchId]
  );
  return rows;
}

export async function findById(id, clientId = null) {
  const { rows } = await pool.query(
    `${BASE_SELECT}
     WHERE bp.id = $1 ${clientId ? "AND bp.client_id = $2" : ""}`,
    clientId ? [id, clientId] : [id]
  );
  return rows[0] ?? null;
}

export async function create({ branch_id, product_id, price, cost, min_stock, reorder_point, currency, client_id }) {
  // Evitar duplicados
  const { rows: existing } = await pool.query(
    `SELECT id FROM branch_products WHERE branch_id=$1 AND product_id=$2 AND client_id=$3`,
    [branch_id, product_id, client_id]
  );
  if (existing.length) throw Object.assign(new Error("El producto ya existe en esta sucursal"), { status: 409 });

  const { rows } = await pool.query(
    `INSERT INTO branch_products (branch_id, product_id, price, cost, min_stock, reorder_point, currency, client_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [branch_id, product_id, price ?? 0, cost ?? 0, min_stock ?? 0, reorder_point ?? 0, currency ?? "MXN", client_id]
  );
  return rows[0];
}

export async function update(id, data) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  if (!Object.keys(filtered).length) return null;

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE branch_products SET ${fields.join(", ")}, updated_at=NOW()
     WHERE id=$${values.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] ?? null;
}

export async function toggleStatus(id, newStatus) {
  if (typeof newStatus !== "boolean") throw Object.assign(new Error("is_active debe ser boolean"), { status: 400 });

  const { rows } = await pool.query(
    `UPDATE branch_products SET is_active=$1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [newStatus, id]
  );
  return rows[0] ?? null;
}

export async function remove(id) {
  const { rows } = await pool.query(
    "DELETE FROM branch_products WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0] ?? null;
}

export async function upsertStock(branch_id, product_id, qty, unit_cost, client_id) {
  const { rows } = await pool.query(
    `SELECT id, stock, cost FROM branch_products WHERE branch_id=$1 AND product_id=$2`,
    [branch_id, product_id]
  );

  if (rows.length) {
    const { id, stock, cost } = rows[0];
    const prevStock = Number(stock ?? 0);
    const prevCost  = Number(cost  ?? 0);
    const delta     = Number(qty);
    const newStock  = Math.max(0, prevStock + delta);

    let newCost = prevCost;
    if (delta > 0) {
      const total = prevStock + delta;
      newCost = total > 0 ? (prevStock * prevCost + delta * unit_cost) / total : unit_cost;
    }

    await pool.query(
      `UPDATE branch_products SET stock=$1, cost=$2, updated_at=NOW() WHERE id=$3`,
      [newStock, newCost, id]
    );

    // Avisar si el stock quedó en 0 por ajuste negativo
    if (newStock === 0 && prevStock + delta < 0) {
      console.warn(`[branchProduct] Stock de product_id=${product_id} branch_id=${branch_id} truncado a 0 (delta=${delta})`);
    }
  } else {
    if (!client_id)
      throw Object.assign(new Error("client_id requerido para crear branch_product"), { status: 400 });
    await pool.query(
      `INSERT INTO branch_products (branch_id, product_id, stock, cost, price, min_stock, reorder_point, currency, is_active, client_id)
       VALUES ($1,$2,$3,$4,0,0,0,'MXN',true,$5)`,
      [branch_id, product_id, Math.max(0, qty), unit_cost, client_id]
    );
  }
}