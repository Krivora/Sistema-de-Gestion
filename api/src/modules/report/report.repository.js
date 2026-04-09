import pool from "../../config/db.js";

const isSuperAdmin = (role) => role === "superadmin";

function parseDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (isNaN(start) || isNaN(end)) throw Object.assign(new Error("Fechas inválidas"), { status: 400 });
  if (start > end) throw Object.assign(new Error("startDate debe ser anterior a endDate"), { status: 400 });
  return { start, end };
}

export async function getCurrentStockByBranch(branchId, categoryId, clientId, roleName) {
  const params = [];
  const conds  = [];

  if (!isSuperAdmin(roleName)) {
    params.push(clientId);
    conds.push(`p.client_id = $${params.length}`);
  }
  if (branchId) {
    const v = parseInt(branchId, 10);
    if (!isNaN(v)) { params.push(v); conds.push(`bp.branch_id = $${params.length}`); }
  }
  if (categoryId) {
    const v = parseInt(categoryId, 10);
    if (!isNaN(v)) { params.push(v); conds.push(`p.category_id = $${params.length}`); }
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT b.name AS branch_name,
            p.id AS product_id, p.name AS product_name, p.sku,
            c.name AS category_name, bp.price,
            COALESCE(SUM(CASE
              WHEN t.type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN t.qty
              WHEN t.type IN ('SALE','ADJUSTMENT_OUT','TRANSFER_OUT')   THEN -t.qty
              ELSE 0
            END), 0) AS stock
     FROM products p
     JOIN branch_products bp ON bp.product_id = p.id
     JOIN branches b ON b.id = bp.branch_id
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN inventory_transactions t
       ON t.product_id = p.id AND t.branch_id = bp.branch_id
     ${where}
     GROUP BY b.name, p.id, p.name, p.sku, c.name, bp.price
     ORDER BY b.name, p.name`,
    params
  );
  return rows;
}

export async function getSalesByPeriod({ startDate, endDate, clientId, roleName }) {
  const { start, end } = parseDateRange(startDate, endDate);
  const params = [start, end];
  const extra  = !isSuperAdmin(roleName) ? (params.push(clientId), `AND s.client_id = $${params.length}`) : "";

  const { rows } = await pool.query(
    `SELECT DATE(s.created_at) AS date,
            COUNT(DISTINCT s.id) AS sales_count,
            COALESCE(SUM(i.qty * i.unit_price), 0) AS total_sales
     FROM sales s
     JOIN sale_items i ON i.sale_id = s.id
     WHERE s.created_at BETWEEN $1 AND $2 ${extra}
     GROUP BY DATE(s.created_at) ORDER BY date`,
    params
  );
  return rows;
}

export async function getPurchasesByPeriod({ startDate, endDate, clientId, roleName }) {
  const { start, end } = parseDateRange(startDate, endDate);
  const params = [start, end];
  const extra  = !isSuperAdmin(roleName) ? (params.push(clientId), `AND p.client_id = $${params.length}`) : "";

  const { rows } = await pool.query(
    `SELECT DATE(p.created_at) AS date,
            COUNT(DISTINCT p.id) AS purchase_count,
            COALESCE(SUM(i.qty * i.unit_cost), 0) AS total_spent
     FROM purchases p
     JOIN purchase_items i ON i.purchase_id = p.id
     WHERE p.created_at BETWEEN $1 AND $2 ${extra}
     GROUP BY DATE(p.created_at) ORDER BY date`,
    params
  );
  return rows;
}

export async function getTopSellingProducts(limit, clientId, roleName) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const params    = [safeLimit];
  const extra     = !isSuperAdmin(roleName) ? (params.push(clientId), `AND p.client_id = $${params.length}`) : "";

  const { rows } = await pool.query(
    `SELECT p.name AS product_name,
            SUM(i.qty) AS total_qty,
            COALESCE(SUM(i.qty * i.unit_price), 0) AS total_sales
     FROM sale_items i
     JOIN products p ON p.id = i.product_id
     WHERE 1=1 ${extra}
     GROUP BY p.name
     ORDER BY total_sales DESC
     LIMIT $1`,
    params
  );
  return rows;
}

export async function getDashboardSummary({ startDate, endDate, clientId, roleName }) {
  const { start, end } = parseDateRange(startDate, endDate);
  const params = [start, end];
  const extra  = !isSuperAdmin(roleName) ? (params.push(clientId), `AND client_id = $${params.length}`) : "";

  // Una sola query con CTEs en lugar de 4 subqueries con parámetros repetidos
  const { rows } = await pool.query(
    `WITH period AS (SELECT $1::timestamptz AS s, $2::timestamptz AS e)
     SELECT
       (SELECT COUNT(*)        FROM sales         WHERE created_at BETWEEN (SELECT s FROM period) AND (SELECT e FROM period) ${extra}) AS total_sales,
       (SELECT COUNT(*)        FROM purchases      WHERE created_at BETWEEN (SELECT s FROM period) AND (SELECT e FROM period) ${extra}) AS total_purchases,
       (SELECT COALESCE(SUM(i.qty * i.unit_price),0)
          FROM sale_items i JOIN sales s ON s.id=i.sale_id
          WHERE s.created_at BETWEEN (SELECT s FROM period) AND (SELECT e FROM period) ${extra.replace("client_id", "s.client_id")}) AS total_revenue,
       (SELECT COALESCE(SUM(i.qty * i.unit_cost),0)
          FROM purchase_items i JOIN purchases p ON p.id=i.purchase_id
          WHERE p.created_at BETWEEN (SELECT s FROM period) AND (SELECT e FROM period) ${extra.replace("client_id", "p.client_id")}) AS total_expense`,
    params
  );
  return rows[0];
}