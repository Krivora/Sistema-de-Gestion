import pool from "../config/db.js";

// 🧩 INVENTARIO: Stock actual por sucursal y producto
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
      c.name AS category_name,         -- 👈 categoría
      bp.price AS price,               -- 👈 precio por sucursal
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
    LEFT JOIN categories c ON c.id = p.category_id   -- 👈 agregamos la categoría
    LEFT JOIN inventory_transactions t ON t.product_id = p.id AND t.branch_id = bp.branch_id
    ${where}
    GROUP BY b.name, p.id, p.name, p.sku, c.name, bp.price
    ORDER BY b.name, p.name;
    `,
    params
  );
  return rows;
}

// 💰 VENTAS: Ventas por periodo
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

// 🛍️ TOP productos más vendidos
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

// 🧾 COMPRAS: Compras por periodo
export async function getPurchasesByPeriod({ startDate, endDate }) {
  const { rows } = await pool.query(
    `
    SELECT 
      DATE(p.created_at) AS date,
      COUNT(DISTINCT p.id) AS purchase_count,
      SUM(i.qty * i.unit_cost) AS total_spent
    FROM purchases p
    JOIN purchase_items i ON i.purchase_id = p.id
    WHERE p.created_at BETWEEN $1 AND $2
    GROUP BY DATE(p.created_at)
    ORDER BY date
    `,
    [startDate, endDate]
  );
  return rows;
}

// 📊 DASHBOARD: Totales rápidos
export async function getDashboardSummary({ startDate, endDate }) {
  const { rows } = await pool.query(
    `
    SELECT 
      (SELECT COUNT(*) FROM sales WHERE created_at BETWEEN $1 AND $2) AS total_sales,
      (SELECT COUNT(*) FROM purchases WHERE created_at BETWEEN $1 AND $2) AS total_purchases,
      (SELECT COALESCE(SUM(i.qty * i.unit_price),0) 
        FROM sale_items i 
        JOIN sales s ON s.id = i.sale_id 
        WHERE s.created_at BETWEEN $1 AND $2) AS total_revenue,
      (SELECT COALESCE(SUM(i.qty * i.unit_cost),0)
        FROM purchase_items i
        JOIN purchases p ON p.id = i.purchase_id
        WHERE p.created_at BETWEEN $1 AND $2) AS total_expense
    `,
    [startDate, endDate]
  );
  return rows[0];
}
