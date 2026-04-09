import pool from "../../config/db.js";

export async function createHeader(client, data) {
  const { rows: seq } = await client.query(`SELECT nextval('adjustments_doc_seq') AS seq`);
  const docNo = `AJ-${data.client_id}-${String(seq[0].seq).padStart(4, "0")}`;

  const { rows } = await client.query(
    `INSERT INTO adjustments (client_id, branch_id, user_id, note, doc_no, type)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.client_id, data.branch_id, data.user_id, data.note ?? null, docNo, data.type]
  );
  return rows[0];
}

export async function addItem(client, data) {
  const { rows } = await client.query(
    `INSERT INTO adjustment_items (adjustment_id, product_id, qty, note, client_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [data.adjustment_id, data.product_id, data.qty, data.note ?? null, data.client_id]
  );
  return rows[0];
}

export async function setPosted(client, id, clientId) {
  const { rows } = await client.query(
    `UPDATE adjustments SET posted=TRUE, posted_at=NOW()
     WHERE id=$1 AND client_id=$2 RETURNING *`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findAll(clientId, filters = {}) {
  const conds = ["a.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.branch_id) {
    const parsed = parseInt(filters.branch_id, 10);
    if (!isNaN(parsed)) { conds.push(`a.branch_id = $${i++}`); params.push(parsed); }
  }
  if (filters.date_from) {
    const d = new Date(filters.date_from);
    if (!isNaN(d)) { conds.push(`a.created_at >= $${i++}`); params.push(d); }
  }
  if (filters.date_to) {
    const d = new Date(filters.date_to);
    if (!isNaN(d)) { conds.push(`a.created_at < $${i++}`); params.push(d); }
  }

  const { rows } = await pool.query(
    `SELECT a.id, a.doc_no, a.type, a.note, a.posted, a.posted_at, a.created_at,
            b.name AS branch_name, u.name AS user_name
     FROM adjustments a
     JOIN branches b ON b.id = a.branch_id
     JOIN users u ON u.id = a.user_id
     WHERE ${conds.join(" AND ")}
     ORDER BY a.created_at DESC
     LIMIT 500`,
    params
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT a.id, a.doc_no, a.type, a.note, a.posted, a.posted_at, a.created_at,
            b.name AS branch_name, u.name AS user_name
     FROM adjustments a
     JOIN branches b ON b.id = a.branch_id
     JOIN users u ON u.id = a.user_id
     WHERE a.id=$1 AND a.client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findItems(adjustmentId, clientId) {
  const { rows } = await pool.query(
    `SELECT ai.id, ai.qty, ai.note, p.name AS product_name, p.sku
     FROM adjustment_items ai
     JOIN products p ON p.id = ai.product_id
     WHERE ai.adjustment_id=$1 AND ai.client_id=$2
     ORDER BY ai.id ASC`,
    [adjustmentId, clientId]
  );
  return rows;
}