import pool from "../config/db.js";

export async function findAll(
  clientId,
  { status, branch_id, date_from, date_to } = {}
) {
  const conds = ["p.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (status) {
    conds.push(`p.status = $${i++}`);
    params.push(status);
  }
  if (branch_id) {
    conds.push(`p.branch_id = $${i++}`);
    params.push(branch_id);
  }
  if (date_from) {
    conds.push(`p.created_at >= $${i++}`);
    params.push(date_from);
  }
  if (date_to) {
    conds.push(`p.created_at < $${i++}`);
    params.push(date_to);
  }

  const query = `
    SELECT 
      p.*, 
      b.name AS branch_name, 
      u.name AS user_name
    FROM purchases p
    LEFT JOIN branches b ON b.id = p.branch_id
    LEFT JOIN users u ON u.id = p.user_id
    WHERE ${conds.join(" AND ")}
    ORDER BY p.id DESC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `
    SELECT 
      p.*, 
      b.name AS branch_name, 
      u.name AS user_name
    FROM purchases p
    LEFT JOIN branches b ON b.id = p.branch_id
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = $1 AND p.client_id = $2
    `,
    [id, clientId]
  );

  return rows[0];
}

export async function findItems(purchaseId, clientId) {
  const { rows } = await pool.query(
    `
    SELECT 
      pi.*, 
      p.name AS product_name, 
      p.sku
    FROM purchase_items pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.purchase_id = $1 
      AND pi.client_id = $2
    ORDER BY pi.id ASC
    `,
    [purchaseId, clientId]
  );
  return rows;
}


export async function createHeader(client, payload) {
  // 🧩 Generar doc_no si no viene
  let doc_no = payload.doc_no;
  if (!doc_no) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    doc_no = `CP-${random}`; // ejemplo: CP-A1B2C3
  }

  const { rows } = await client.query(
    `
    INSERT INTO purchases (
      doc_no, branch_id, client_id, user_id, supplier_id, created_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
    `,
    [
      doc_no,                     // ✅ doc_no generado o el recibido
      payload.branch_id,
      payload.client_id,
      payload.user_id || null,
      payload.supplier_id || null
    ]
  );

  return rows[0];
}


export async function addItem(client, { purchase_id, product_id, qty, unit_cost, client_id }) {
  const { rows } = await client.query(
    `
    INSERT INTO purchase_items (purchase_id, product_id, qty, unit_cost, client_id)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [purchase_id, product_id, qty, unit_cost, client_id]
  );
  return rows[0];
}

export async function setPosted(client, purchase_id, client_id) {
  const { rows } = await client.query(
    `
    UPDATE purchases
    SET status = 'posted', posted_at = NOW()
    WHERE id = $1 AND client_id = $2
    RETURNING *
    `,
    [purchase_id, client_id]
  );
  return rows[0];
}
