import pool from "../config/db.js";

// 📦 Listar todos los productos por sucursal (opcionalmente filtrados por cliente)
export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT 
        bp.*, 
        p.name AS product_name, 
        p.sku, 
        b.name AS branch_name,
        c.name AS client_name,
        COALESCE((
          SELECT SUM(
            CASE 
              WHEN t.type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN t.qty
              WHEN t.type IN ('SALE','ADJUSTMENT_OUT','TRANSFER_OUT') THEN -t.qty
              ELSE 0
            END
          )
          FROM inventory_transactions t
          WHERE t.product_id = bp.product_id
            AND t.branch_id = bp.branch_id
            AND t.client_id = bp.client_id
        ), 0) AS current_stock
      FROM branch_products bp
      JOIN products p ON p.id = bp.product_id
      JOIN branches b ON b.id = bp.branch_id
      JOIN clients c ON c.id = bp.client_id
      WHERE bp.client_id = $1
      ORDER BY b.name, p.name
    `
    : `
      SELECT 
        bp.*, 
        p.name AS product_name, 
        p.sku, 
        b.name AS branch_name,
        c.name AS client_name,
        COALESCE((
          SELECT SUM(
            CASE 
              WHEN t.type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN t.qty
              WHEN t.type IN ('SALE','ADJUSTMENT_OUT','TRANSFER_OUT') THEN -t.qty
              ELSE 0
            END
          )
          FROM inventory_transactions t
          WHERE t.product_id = bp.product_id
            AND t.branch_id = bp.branch_id
            AND t.client_id = bp.client_id
        ), 0) AS current_stock
      FROM branch_products bp
      JOIN products p ON p.id = bp.product_id
      JOIN branches b ON b.id = bp.branch_id
      JOIN clients c ON c.id = bp.client_id
      ORDER BY c.name, b.name, p.name
    `;

  const { rows } = await pool.query(query, clientId ? [clientId] : []);
  return rows;
}

// 📍 Listar productos por sucursal
export async function findByBranch(branchId, clientId = null) {
  const query = `
    SELECT 
      bp.*, 
      p.name AS product_name, 
      p.sku,
      b.name AS branch_name,
      c.name AS client_name,
      COALESCE((
        SELECT SUM(
          CASE 
            WHEN t.type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN t.qty
            WHEN t.type IN ('SALE','ADJUSTMENT_OUT','TRANSFER_OUT') THEN -t.qty
            ELSE 0
          END
        )
        FROM inventory_transactions t
        WHERE t.product_id = bp.product_id
          AND t.branch_id = bp.branch_id
          AND t.client_id = bp.client_id
      ), 0) AS current_stock
    FROM branch_products bp
    JOIN products p ON p.id = bp.product_id
    JOIN branches b ON b.id = bp.branch_id
    JOIN clients c ON c.id = bp.client_id
    WHERE bp.branch_id = $1
    ${clientId ? "AND bp.client_id = $2" : ""}
    ORDER BY p.name
  `;

  const { rows } = await pool.query(
    clientId ? [branchId, clientId] : [branchId]
  );
  return rows;
}

// 🔍 Buscar producto por ID (con client_id opcional)
export async function findById(id, clientId = null) {
  const query = `
    SELECT 
      bp.*, 
      p.name AS product_name, 
      p.sku, 
      b.name AS branch_name,
      c.name AS client_name
    FROM branch_products bp
    JOIN products p ON p.id = bp.product_id
    JOIN branches b ON b.id = bp.branch_id
    JOIN clients c ON c.id = bp.client_id
    WHERE bp.id = $1
    ${clientId ? "AND bp.client_id = $2" : ""}
  `;

  const params = clientId ? [id, clientId] : [id];
  const { rows } = await pool.query(query, params);
  return rows[0];
}


// ➕ Crear relación
export async function create({
  branch_id,
  product_id,
  price,
  cost,
  min_stock,
  reorder_point,
  currency,
  client_id, // 👈 nuevo parámetro
}) {
  const { rows } = await pool.query(
    `
    INSERT INTO branch_products 
      (branch_id, product_id, price, cost, min_stock, reorder_point, currency, client_id)
    VALUES 
      ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [branch_id, product_id, price, cost, min_stock, reorder_point, currency, client_id]
  );
  return rows[0];
}


// ✏️ Actualizar
export async function update(id, {
  price,
  cost,
  min_stock,
  reorder_point,
  currency,
  is_active,
}) {
  const { rows } = await pool.query(
    `UPDATE branch_products
     SET price=$1, cost=$2, min_stock=$3, reorder_point=$4,currency=$5,
         is_active=$6, updated_at=NOW()
     WHERE id=$7
     RETURNING *`,
    [price, cost, min_stock, reorder_point, currency, is_active, id]
  );
  return rows[0];
}

// 🔄 Cambiar estado (activar/desactivar)
export async function toggleStatus(id, newStatus) {
  const { rows } = await pool.query(
    `UPDATE branch_products
     SET is_active = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newStatus, id]
  );
  return rows[0];
}

// 🗑️ Eliminar
export async function remove(id) {
  const { rows } = await pool.query(
    "DELETE FROM branch_products WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0];
}

/**
 * 📦 Crear o actualizar producto en sucursal y ajustar stock + costo promedio
 * Si el producto no existe en esa sucursal, lo crea con stock inicial.
 * Si ya existe, suma la cantidad al stock actual y recalcula costo promedio ponderado.
 */
export async function upsertStock(branch_id, product_id, qty, unit_cost) {
  const { rows } = await pool.query(
    `SELECT id, stock, cost 
     FROM branch_products 
     WHERE branch_id = $1 AND product_id = $2`,
    [branch_id, product_id]
  );

  if (rows.length > 0) {
    // Ya existe
    const current = rows[0];
    const prevStock = Number(current.stock || 0);
    const prevCost = Number(current.cost || 0);
    const delta = Number(qty);

    let newStock = prevStock + delta;
    let newCost = prevCost;

    if (delta > 0) {
      // 💰 Movimiento de entrada: recalcular costo promedio ponderado
      const totalValueBefore = prevStock * prevCost;
      const totalValueAfter = delta * unit_cost;
      const totalQty = prevStock + delta;

      newCost = totalQty > 0 ? (totalValueBefore + totalValueAfter) / totalQty : unit_cost;
    }

    // No permitir stock negativo (opcional)
    if (newStock < 0) newStock = 0;

    await pool.query(
      `UPDATE branch_products
       SET stock = $1, cost = $2, updated_at = NOW()
       WHERE id = $3`,
      [newStock, newCost, current.id]
    );
  } else {
    // No existe: crear con stock inicial y costo actual
    await pool.query(
      `INSERT INTO branch_products 
        (branch_id, product_id, stock, cost, price, min_stock, reorder_point, tax_rate, currency, is_active)
       VALUES ($1,$2,$3,$4,0,0,0,0,'MXN',true)`,
      [branch_id, product_id, qty, unit_cost]
    );
  }
}
