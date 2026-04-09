import pool from "../../config/db.js";

export async function createHeader(trx, data) {
  const { rows: seq } = await trx.query(`SELECT nextval('transfers_doc_seq') AS seq`);
  const docNo = `TR-${data.client_id}-${String(seq[0].seq).padStart(4, "0")}`;

  const { rows } = await trx.query(
    `INSERT INTO transfers (client_id, from_branch_id, to_branch_id, note, created_by, doc_no)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.client_id, data.from_branch_id, data.to_branch_id,
     data.note ?? null, data.created_by, docNo]
  );
  return rows[0];
}

export async function addItem(trx, { transfer_id, product_id, qty, client_id }) {
  const { rows } = await trx.query(
    `INSERT INTO transfer_items (transfer_id, product_id, qty, client_id)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [transfer_id, product_id, qty, client_id]
  );
  return rows[0];
}

export async function setPosted(trx, id, clientId) {
  const { rows } = await trx.query(
    `UPDATE transfers SET posted=TRUE, posted_at=NOW()
     WHERE id=$1 AND client_id=$2 RETURNING *`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findAll(clientId, filters = {}) {
  const conds = ["t.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.from_branch_id) {
    const v = parseInt(filters.from_branch_id, 10);
    if (!isNaN(v)) { conds.push(`t.from_branch_id = $${i++}`); params.push(v); }
  }
  if (filters.to_branch_id) {
    const v = parseInt(filters.to_branch_id, 10);
    if (!isNaN(v)) { conds.push(`t.to_branch_id = $${i++}`); params.push(v); }
  }
  if (filters.date_from) {
    const d = new Date(filters.date_from);
    if (!isNaN(d)) { conds.push(`t.created_at >= $${i++}`); params.push(d); }
  }
  if (filters.date_to) {
    const d = new Date(filters.date_to);
    if (!isNaN(d)) { conds.push(`t.created_at < $${i++}`); params.push(d); }
  }

  const { rows } = await pool.query(
    `SELECT t.id, t.doc_no, t.posted, t.posted_at, t.note, t.created_at,
            fb.name AS from_branch_name, tb.name AS to_branch_name,
            u.name AS user_name
     FROM transfers t
     JOIN branches fb ON fb.id = t.from_branch_id
     JOIN branches tb ON tb.id = t.to_branch_id
     JOIN users u ON u.id = t.created_by
     WHERE ${conds.join(" AND ")}
     ORDER BY t.created_at DESC
     LIMIT 500`,
    params
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT t.id, t.doc_no, t.posted, t.posted_at, t.note, t.created_at,
            fb.name AS from_branch_name, tb.name AS to_branch_name,
            u.name AS user_name
     FROM transfers t
     JOIN branches fb ON fb.id = t.from_branch_id
     JOIN branches tb ON tb.id = t.to_branch_id
     JOIN users u ON u.id = t.created_by
     WHERE t.id=$1 AND t.client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findItems(transferId, clientId) {
  const { rows } = await pool.query(
    `SELECT ti.id, ti.qty, p.name AS product_name, p.sku
     FROM transfer_items ti
     JOIN products p ON p.id = ti.product_id
     WHERE ti.transfer_id=$1 AND ti.client_id=$2
     ORDER BY ti.id ASC`,
    [transferId, clientId]
  );
  return rows;
}