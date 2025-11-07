import pool from "../config/db.js";

/**
 * 🧾 Crear encabezado de transferencia
 */
export async function createHeader(client, data) {
  // 🔹 Obtener el siguiente número de folio
  const { rows: seq } = await client.query(`SELECT nextval('transfers_doc_seq') AS seq;`);
  const next = seq[0].seq;

  // 🔹 Formato del folio: TR-{client_id}-{0001}
  const docNo = `TR-${data.client_id}-${String(next).padStart(4, "0")}`;

  const { rows } = await client.query(
    `INSERT INTO transfers (client_id, from_branch_id, to_branch_id, note, created_by, doc_no)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.client_id, data.from_branch_id, data.to_branch_id, data.note || null, data.created_by, docNo]
  );

  return rows[0];
}

/**
 * 🧩 Agregar item de transferencia
 */
export async function addItem(client, data) {
  const { rows } = await client.query(
    `INSERT INTO transfer_items (transfer_id, product_id, qty, client_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.transfer_id, data.product_id, data.qty, data.client_id]
  );
  return rows[0];
}

/**
 * 📤 Marcar transferencia como publicada
 */
export async function setPosted(client, id, clientId) {
  const { rows } = await client.query(
    `UPDATE transfers
     SET posted = TRUE, posted_at = NOW()
     WHERE id = $1 AND client_id = $2
     RETURNING *`,
    [id, clientId]
  );
  return rows[0];
}

/**
 * 📋 Listar encabezados
 */
export async function findAll(clientId, filters = {}) {
  const conditions = ["t.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.from_branch_id) conditions.push(`t.from_branch_id = $${i++}`), params.push(filters.from_branch_id);
  if (filters.to_branch_id) conditions.push(`t.to_branch_id = $${i++}`), params.push(filters.to_branch_id);
  if (filters.date_from) conditions.push(`t.created_at >= $${i++}`), params.push(filters.date_from);
  if (filters.date_to) conditions.push(`t.created_at < $${i++}`), params.push(filters.date_to);

  const { rows } = await pool.query(
    `SELECT t.*, fb.name AS from_branch_name, tb.name AS to_branch_name, u.name AS user_name
     FROM transfers t
     JOIN branches fb ON fb.id = t.from_branch_id
     JOIN branches tb ON tb.id = t.to_branch_id
     JOIN users u ON u.id = t.created_by
     WHERE ${conditions.join(" AND ")}
     ORDER BY t.created_at DESC`,
    params
  );
  return rows;
}

/**
 * 🔍 Obtener encabezado por ID
 */
export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT t.*, fb.name AS from_branch_name, tb.name AS to_branch_name, u.name AS user_name
     FROM transfers t
     JOIN branches fb ON fb.id = t.from_branch_id
     JOIN branches tb ON tb.id = t.to_branch_id
     JOIN users u ON u.id = t.created_by
     WHERE t.id = $1 AND t.client_id = $2`,
    [id, clientId]
  );
  return rows[0];
}

/**
 * 📦 Obtener items de la transferencia
 */
export async function findItems(transferId, clientId) {
  const { rows } = await pool.query(
    `SELECT ti.*, p.name AS product_name
     FROM transfer_items ti
     JOIN products p ON p.id = ti.product_id
     WHERE ti.transfer_id = $1 AND ti.client_id = $2
     ORDER BY ti.id ASC`,
    [transferId, clientId]
  );
  return rows;
}
