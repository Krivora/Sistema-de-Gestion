import pool from "../../config/db.js";

const VALID_STATUSES = ["open", "posted", "cancelled"];
const VALID_PAYMENT_METHODS = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "OTRO"];

export async function findAll(clientId, { status, branch_id, date_from, date_to } = {}) {
  const conds = ["s.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (status && VALID_STATUSES.includes(status)) {
    conds.push(`s.status = $${i++}`); params.push(status);
  }
  if (branch_id) {
    const v = parseInt(branch_id, 10);
    if (!isNaN(v)) { conds.push(`s.branch_id = $${i++}`); params.push(v); }
  }
  if (date_from) {
    const d = new Date(date_from);
    if (!isNaN(d)) { conds.push(`s.created_at >= $${i++}`); params.push(d); }
  }
  if (date_to) {
    const d = new Date(date_to);
    if (!isNaN(d)) { conds.push(`s.created_at < $${i++}`); params.push(d); }
  }

  const { rows } = await pool.query(
    `SELECT s.id, s.doc_no, s.status, s.payment_method,
            s.subtotal, s.total, s.posted_at, s.created_at,
            b.name AS branch_name, u.name AS user_name,
            COALESCE(c.name, s.customer_name) AS customer_name,
            COALESCE(c.phone, s.customer_phone) AS customer_phone,
            c.email AS customer_email
     FROM sales s
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN users u ON u.id = s.user_id
     LEFT JOIN customers c ON c.id = s.customer_id
     WHERE ${conds.join(" AND ")}
     ORDER BY s.id DESC
     LIMIT 500`,
    params
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.doc_no, s.status, s.payment_method, s.subtotal, s.total,
            s.customer_id, s.customer_name, s.customer_phone,
            s.posted_at, s.created_at,
            b.name AS branch_name, b.code AS branch_code,
            u.name AS user_name, c.name AS customer_name_full
     FROM sales s
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN users u ON u.id = s.user_id
     LEFT JOIN customers c ON c.id = s.customer_id
     WHERE s.id=$1 AND s.client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findItems(saleId, clientId) {
  const { rows } = await pool.query(
    `SELECT si.id, si.qty, si.unit_price, p.name AS product_name, p.sku
     FROM sale_items si
     JOIN products p ON p.id = si.product_id
     WHERE si.sale_id=$1 AND si.client_id=$2
     ORDER BY si.id ASC`,
    [saleId, clientId]
  );
  return rows;
}

export async function createHeader(trx, payload) {
  const { rows: seq } = await trx.query(`SELECT nextval('sales_doc_seq') AS seq`);
  const doc_no = payload.doc_no || `VT-${String(seq[0].seq).padStart(5, "0")}`;

  const payment = VALID_PAYMENT_METHODS.includes(payload.payment_method)
    ? payload.payment_method : "EFECTIVO";

  const { rows } = await trx.query(
    `INSERT INTO sales
       (doc_no, branch_id, client_id, user_id, customer_id,
        customer_name, customer_phone, payment_method, subtotal, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,0) RETURNING *`,
    [doc_no, payload.branch_id, payload.client_id, payload.user_id ?? null,
      payload.customer_id ?? null, payload.customer_name ?? null,
      payload.customer_phone ?? null, payment]
  );
  return rows[0];
}

export async function addItem(trx, { sale_id, product_id, qty, unit_price, client_id }) {
  const { rows } = await trx.query(
    `INSERT INTO sale_items (sale_id, product_id, qty, unit_price, client_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [sale_id, product_id, qty, unit_price, client_id]
  );
  return rows[0];
}

export async function updateTotals(trx, saleId, clientId) {
  const { rows } = await trx.query(
    `UPDATE sales s
     SET subtotal = t.subtotal, total = t.total, updated_at=NOW()
     FROM (
       SELECT si.sale_id,
              SUM(si.qty * si.unit_price)::numeric(10,2) AS subtotal,
              SUM(si.qty * si.unit_price)::numeric(10,2) AS total
       FROM sale_items si
       WHERE si.sale_id=$1 AND si.client_id=$2
       GROUP BY si.sale_id
     ) t
     WHERE s.id=t.sale_id AND s.client_id=$2
     RETURNING s.id, s.subtotal, s.total`,
    [saleId, clientId]
  );
  return rows[0] ?? null;
}

export async function setPosted(trx, saleId, clientId) {
  const { rows } = await trx.query(
    `UPDATE sales SET status='posted', posted_at=NOW()
     WHERE id=$1 AND client_id=$2 RETURNING *`,
    [saleId, clientId]
  );
  return rows[0] ?? null;
}