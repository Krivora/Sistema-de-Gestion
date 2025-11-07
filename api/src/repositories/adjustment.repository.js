import pool from "../config/db.js";

/**
 * 🧾 Crear encabezado de ajuste
 */
export async function createHeader(client, data) {
  // 🔹 Obtener el siguiente número de folio
  const { rows: seq } = await client.query(`SELECT nextval('adjustments_doc_seq') AS seq;`);
  const next = seq[0].seq;
  
  // 🔹 Formato del folio: AJ-00001 o AJ-{client_id}-{00001}
  const docNo = `AJ-${data.client_id}-${String(next).padStart(4, "0")}`;
  const { rows } = await client.query(
    `INSERT INTO adjustments (client_id, branch_id, user_id, note, doc_no, type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [data.client_id, data.branch_id, data.user_id, data.note || null, docNo, data.type]
  );

  return rows[0];
}


/**
 * 🧩 Agregar item (producto ajustado)
 */
export async function addItem(client, data) {
  const { rows } = await client.query(
    `INSERT INTO adjustment_items (adjustment_id, product_id, qty, note, client_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.adjustment_id,
      data.product_id,
      data.qty,
      data.note || null,
      data.client_id,
    ]
  );
  return rows[0];
}

/**
 * 📤 Marcar ajuste como publicado
 */
export async function setPosted(client, id, clientId) {
  const { rows } = await client.query(
    `UPDATE adjustments
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
  const conditions = ["a.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.branch_id) conditions.push(`a.branch_id = $${i++}`), params.push(filters.branch_id);
  if (filters.date_from) conditions.push(`a.created_at >= $${i++}`), params.push(filters.date_from);
  if (filters.date_to) conditions.push(`a.created_at < $${i++}`), params.push(filters.date_to);

  const { rows } = await pool.query(
    `SELECT a.*, b.name AS branch_name, u.name AS user_name
     FROM adjustments a
     JOIN branches b ON b.id = a.branch_id
     JOIN users u ON u.id = a.user_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY a.created_at DESC`,
    params
  );
  return rows;
}

/**
 * 🔍 Obtener encabezado por ID
 */
export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT a.*, b.name AS branch_name, u.name AS user_name
     FROM adjustments a
     JOIN branches b ON b.id = a.branch_id
     JOIN users u ON u.id = a.user_id
     WHERE a.id = $1 AND a.client_id = $2`,
    [id, clientId]
  );
  return rows[0];
}

/**
 * 📦 Obtener items del ajuste
 */
export async function findItems(adjustmentId, clientId) {
  const { rows } = await pool.query(
    `SELECT ai.*, p.name AS product_name
     FROM adjustment_items ai
     JOIN products p ON p.id = ai.product_id
     WHERE ai.adjustment_id = $1 AND ai.client_id = $2
     ORDER BY ai.id ASC`,
    [adjustmentId, clientId]
  );
  return rows;
}
