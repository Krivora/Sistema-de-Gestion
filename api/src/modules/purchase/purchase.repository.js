import pool from "../../config/db.js";

const VALID_STATUSES = ["draft", "posted", "cancelled"];

export async function findAll(clientId, { status, branch_id, date_from, date_to } = {}) {
  const conds = ["p.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (status && VALID_STATUSES.includes(status)) {
    conds.push(`p.status = $${i++}`); params.push(status);
  }
  if (branch_id) {
    const v = parseInt(branch_id, 10);
    if (!isNaN(v)) { conds.push(`p.branch_id = $${i++}`); params.push(v); }
  }
  if (date_from) {
    const d = new Date(date_from);
    if (!isNaN(d)) { conds.push(`p.created_at >= $${i++}`); params.push(d); }
  }
  if (date_to) {
    const d = new Date(date_to);
    if (!isNaN(d)) { conds.push(`p.created_at < $${i++}`); params.push(d); }
  }

  const { rows } = await pool.query(
    `SELECT p.id, p.doc_no, p.status, p.posted_at, p.created_at,
            p.branch_id, p.supplier_id,
            b.name AS branch_name, u.name AS user_name
     FROM purchases p
     LEFT JOIN branches b ON b.id = p.branch_id
     LEFT JOIN users u ON u.id = p.user_id
     WHERE ${conds.join(" AND ")}
     ORDER BY p.id DESC
     LIMIT 500`,
    params
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT p.id, p.doc_no, p.status, p.posted_at, p.created_at,
            p.branch_id, p.supplier_id,
            b.name AS branch_name, u.name AS user_name
     FROM purchases p
     LEFT JOIN branches b ON b.id = p.branch_id
     LEFT JOIN users u ON u.id = p.user_id
     WHERE p.id=$1 AND p.client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findItems(purchaseId, clientId) {
  const { rows } = await pool.query(
    `SELECT pi.id, pi.qty, pi.unit_cost,
            p.name AS product_name, p.sku
     FROM purchase_items pi
     JOIN products p ON p.id = pi.product_id
     WHERE pi.purchase_id=$1 AND pi.client_id=$2
     ORDER BY pi.id ASC`,
    [purchaseId, clientId]
  );
  return rows;
}

export async function createHeader(trx, payload) {
  // Secuencia en lugar de random — evita colisiones
  const { rows: seq } = await trx.query(`SELECT nextval('purchases_doc_seq') AS seq`);
  const doc_no = payload.doc_no || `CP-${String(seq[0].seq).padStart(5, "0")}`;

  const { rows } = await trx.query(
    `INSERT INTO purchases (doc_no, branch_id, client_id, user_id, supplier_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [doc_no, payload.branch_id, payload.client_id,
     payload.user_id ?? null, payload.supplier_id ?? null]
  );
  return rows[0];
}

export async function addItem(trx, { purchase_id, product_id, qty, unit_cost, client_id }) {
  const { rows } = await trx.query(
    `INSERT INTO purchase_items (purchase_id, product_id, qty, unit_cost, client_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [purchase_id, product_id, qty, unit_cost, client_id]
  );
  return rows[0];
}

export async function setPosted(trx, purchaseId, clientId) {
  const { rows } = await trx.query(
    `UPDATE purchases SET status='posted', posted_at=NOW()
     WHERE id=$1 AND client_id=$2 RETURNING *`,
    [purchaseId, clientId]
  );
  return rows[0] ?? null;
}