import pool from "../config/db.js";

// 🔹 Stock actual por sucursal y producto
export async function getCurrentStockByBranch(branchId = null) {
  const params = [];
  let where = "";

  if (branchId) {
    params.push(branchId);
    where = `WHERE bp.branch_id = $1`;
  }

  const { rows } = await pool.query(
    `
    SELECT 
      b.name AS branch_name,
      p.id AS product_id,
      p.name AS product_name,
      p.sku,
      COALESCE(SUM(
        CASE 
          WHEN t.type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN t.qty
          WHEN t.type IN ('SALE','ADJUSTMENT_OUT','TRANSFER_OUT') THEN -t.qty
          ELSE 0
        END
      ), 0) AS stock
    FROM products p
    JOIN branch_products bp ON bp.product_id = p.id
    JOIN branches b ON b.id = bp.branch_id
    LEFT JOIN inventory_transactions t ON t.product_id = p.id AND t.branch_id = bp.branch_id
    ${where}
    GROUP BY b.name, p.id, p.name, p.sku
    ORDER BY b.name, p.name
    `,
    params
  );

  return rows;
}

// 🔹 Ventas por periodo
export async function getSalesByPeriod({ startDate, endDate }) {
  const { rows } = await pool.query(
    `
    SELECT 
      DATE(s.created_at) AS date,
      COUNT(DISTINCT s.id) AS sales_count,
      SUM(i.qty * i.unit_price) AS total_sales
    FROM sales s
    JOIN sale_items i ON i.sale_id = s.id
    WHERE s.created_at BETWEEN $1 AND $2
    GROUP BY DATE(s.created_at)
    ORDER BY date
    `,
    [startDate, endDate]
  );
  return rows;
}

// 🔹 Compras por proveedor
export async function getPurchasesBySupplier() {
  const { rows } = await pool.query(
    `
    SELECT 
      s.name AS supplier_name,
      COUNT(p.id) AS purchase_count,
      SUM(i.qty * i.unit_cost) AS total_spent
    FROM purchases p
    JOIN suppliers s ON s.id = p.supplier_id
    JOIN purchase_items i ON i.purchase_id = p.id
    GROUP BY s.name
    ORDER BY total_spent DESC
    `
  );
  return rows;
}

// 🔹 Top productos más vendidos
export async function getTopSellingProducts(limit = 10) {
  const { rows } = await pool.query(
    `
    SELECT 
      p.name AS product_name,
      SUM(i.qty) AS total_qty,
      SUM(i.qty * i.unit_price) AS total_sales
    FROM sale_items i
    JOIN products p ON p.id = i.product_id
    GROUP BY p.name
    ORDER BY total_sales DESC
    LIMIT $1
    `,
    [limit]
  );
  return rows;
}
