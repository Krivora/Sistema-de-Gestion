import pool from "../config/db.js";

export async function getCurrentStockByBranch(branchId,categoryId, clientId, roleName) {
  const params = [];
  let where = "WHERE 1=1";

  if (roleName !== "superadmin") {
    params.push(clientId);
    where += ` AND p.client_id = $${params.length}`;
  }

  if (branchId) {
    params.push(branchId);
    where += ` AND bp.branch_id = $${params.length}`;
  }

  if (categoryId) {
    params.push(categoryId);
    where += ` AND p.category_id = $${params.length}`;
  }


  const { rows } = await pool.query(
    `
    SELECT 
      b.name AS branch_name,
      p.id AS product_id,
      p.name AS product_name,
      p.sku,
      c.name AS category_name,
      bp.price,
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
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN inventory_transactions t 
      ON t.product_id = p.id 
      AND t.branch_id = bp.branch_id
    ${where}
    GROUP BY b.name, p.id, p.name, p.sku, c.name, bp.price
    ORDER BY b.name, p.name;
    `,
    params
  );
  return rows;
}


export async function getSalesByPeriod({ startDate, endDate, clientId, roleName }) {
  const params = [startDate, endDate];
  let where = `WHERE s.created_at BETWEEN $1 AND $2`;

  if (roleName !== "superadmin") {
    params.push(clientId);
    where += ` AND s.client_id = $${params.length}`;
  }

  const { rows } = await pool.query(
    `
    SELECT 
      DATE(s.created_at) AS date,
      COUNT(DISTINCT s.id) AS sales_count,
      SUM(i.qty * i.unit_price) AS total_sales
    FROM sales s
    JOIN sale_items i ON i.sale_id = s.id
    ${where}
    GROUP BY DATE(s.created_at)
    ORDER BY date
    `,
    params
  );

  return rows;
}


export async function getTopSellingProducts(limit, clientId, roleName) {
  const params = [limit];
  let where = "WHERE 1=1";

  if (roleName !== "superadmin") {
    params.push(clientId);
    where += ` AND p.client_id = $${params.length}`;
  }

  const { rows } = await pool.query(
    `
    SELECT 
      p.name AS product_name,
      SUM(i.qty) AS total_qty,
      SUM(i.qty * i.unit_price) AS total_sales
    FROM sale_items i
    JOIN products p ON p.id = i.product_id
    ${where}
    GROUP BY p.name
    ORDER BY total_sales DESC
    LIMIT $1
    `,
    params
  );

  return rows;
}


export async function getPurchasesByPeriod({ startDate, endDate, clientId, roleName }) {
  const params = [startDate, endDate];
  let where = `WHERE p.created_at BETWEEN $1 AND $2`;

  if (roleName !== "superadmin") {
    params.push(clientId);
    where += ` AND p.client_id = $${params.length}`;
  }

  const { rows } = await pool.query(
    `
    SELECT 
      DATE(p.created_at) AS date,
      COUNT(DISTINCT p.id) AS purchase_count,
      SUM(i.qty * i.unit_cost) AS total_spent
    FROM purchases p
    JOIN purchase_items i ON i.purchase_id = p.id
    ${where}
    GROUP BY DATE(p.created_at)
    ORDER BY date
    `,
    params
  );
  return rows;
}


export async function getDashboardSummary({ startDate, endDate, clientId, roleName }) {
  const params = [startDate, endDate];
  let filter = `BETWEEN $1 AND $2`;

  let clientFilter = "";
  if (roleName !== "superadmin") {
    params.push(clientId);
    clientFilter = ` AND client_id = $${params.length}`;
  }

  const { rows } = await pool.query(
    `
    SELECT 
      (SELECT COUNT(*) FROM sales 
        WHERE created_at ${filter} ${clientFilter}) AS total_sales,

      (SELECT COUNT(*) FROM purchases 
        WHERE created_at ${filter} ${clientFilter}) AS total_purchases,

      (SELECT COALESCE(SUM(i.qty * i.unit_price),0)
        FROM sale_items i 
        JOIN sales s ON s.id = i.sale_id
        WHERE s.created_at ${filter} ${clientFilter}) AS total_revenue,

      (SELECT COALESCE(SUM(i.qty * i.unit_cost),0)
        FROM purchase_items i
        JOIN purchases p ON p.id = i.purchase_id
        WHERE p.created_at ${filter} ${clientFilter}) AS total_expense
    `,
    params
  );

  return rows[0];
}
