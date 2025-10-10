import pool from "../config/db.js";

// 📋 Listar todos (opcional)
export async function findAll() {
  const { rows } = await pool.query(`
    SELECT 
      bp.*, 
      p.name AS product_name, 
      p.sku, 
      b.name AS branch_name,
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
      ), 0) AS current_stock
    FROM branch_products bp
    JOIN products p ON p.id = bp.product_id
    JOIN branches b ON b.id = bp.branch_id
    ORDER BY b.name, p.name
  `);
  return rows;
}

// 📍 Listar productos por sucursal
export async function findByBranch(branchId) {
  const { rows } = await pool.query(
    `
    SELECT 
      bp.*, 
      p.name AS product_name, 
      p.sku,
      b.name AS branch_name,
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
      ), 0) AS current_stock
    FROM branch_products bp
    JOIN products p ON p.id = bp.product_id
    JOIN branches b ON b.id = bp.branch_id
    WHERE bp.branch_id = $1
    ORDER BY p.name
  `,
    [branchId]
  );
  return rows;
}

// 🔍 Buscar por ID
export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT bp.*, p.name AS product_name, p.sku, b.name AS branch_name
     FROM branch_products bp
     JOIN products p ON p.id = bp.product_id
     JOIN branches b ON b.id = bp.branch_id
     WHERE bp.id = $1`,
    [id]
  );
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
}) {
  const { rows } = await pool.query(
    `INSERT INTO branch_products (branch_id, product_id, price, cost, min_stock, reorder_point, currency)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [branch_id, product_id, price, cost, min_stock, reorder_point, currency]
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
     WHERE id=$8
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
