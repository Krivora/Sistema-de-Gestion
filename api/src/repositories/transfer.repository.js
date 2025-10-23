import pool from "../config/db.js";

export async function createTransfer({ client_id, from_branch_id, to_branch_id, note, created_by }) {
  const { rows } = await pool.query(
    `INSERT INTO transfers (client_id, from_branch_id, to_branch_id, note, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [client_id, from_branch_id, to_branch_id, note, created_by]
  );
  return rows[0];
}

export async function addItem(transfer_id, product_id, qty) {
  const { rows } = await pool.query(
    `INSERT INTO transfer_items (transfer_id, product_id, qty)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [transfer_id, product_id, qty]
  );
  return rows[0];
}

export async function findAll(clientId) {
  const { rows } = await pool.query(
    `SELECT t.*, fb.name AS from_branch, tb.name AS to_branch, u.name AS created_by_name
     FROM transfers t
     JOIN branches fb ON fb.id = t.from_branch_id
     JOIN branches tb ON tb.id = t.to_branch_id
     JOIN users u ON u.id = t.created_by
     WHERE t.client_id = $1
     ORDER BY t.id DESC`,
    [clientId]
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT * FROM transfers WHERE id = $1 AND client_id = $2`,
    [id, clientId]
  );
  return rows[0];
}

export async function findItems(transferId) {
  const { rows } = await pool.query(
    `SELECT ti.*, p.name AS product_name
     FROM transfer_items ti
     JOIN products p ON p.id = ti.product_id
     WHERE ti.transfer_id = $1`,
    [transferId]
  );
  return rows;
}
