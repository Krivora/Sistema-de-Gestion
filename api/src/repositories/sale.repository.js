import pool from "../config/db.js";

// Listar ventas por cliente (filtros opcionales)
export async function findAll(clientId, { status, branch_id, date_from, date_to } = {}) {
  const conds = ["s.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (status) { conds.push(`s.status = $${i++}`); params.push(status); }
  if (branch_id) { conds.push(`s.branch_id = $${i++}`); params.push(branch_id); }
  if (date_from) { conds.push(`s.created_at >= $${i++}`); params.push(date_from); }
  if (date_to) { conds.push(`s.created_at < $${i++}`); params.push(date_to); }

  const { rows } = await pool.query(
    `
    SELECT s.*, 
    b.name AS branch_name,
    u.name AS user_name
    FROM sales s
    LEFT JOIN branches b ON b.id = s.branch_id
    LEFT JOIN users u ON u.id = s.user_id
    WHERE ${conds.join(" AND ")}
    ORDER BY s.id DESC
    `,
    params
  );
  return rows;
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `
    SELECT 
      s.*,
      b.name AS branch_name,
      b.code AS branch_code,
      u.name AS user_name,
      c.name AS customer_name_full
    FROM sales s
    LEFT JOIN branches b ON b.id = s.branch_id
    LEFT JOIN users u ON u.id = s.user_id
    LEFT JOIN customers c ON c.id = s.customer_id
    WHERE s.id = $1 AND s.client_id = $2
    `,
    [id, clientId]
  );
  return rows[0];
}


export async function findItems(saleId, clientId) {
  const { rows } = await pool.query(
    `
    SELECT si.*, p.name AS product_name, p.sku
    FROM sale_items si
    JOIN products p ON p.id = si.product_id
    WHERE si.sale_id = $1 AND si.client_id = $2
    ORDER BY si.id ASC
    `,
    [saleId, clientId]
  );
  return rows;
}
export async function createHeader(client, payload) {
  let { doc_no, branch_id, customer_id, customer_name, customer_phone, payment_method, subtotal, total } = payload;

  // 📄 Generar folio automático si no se envía
  if (!doc_no) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    doc_no = `VT-${random}`;
  }

  const { rows } = await client.query(
    `
    INSERT INTO sales (
      doc_no, branch_id, client_id, user_id, customer_id,
      customer_name, customer_phone, payment_method, subtotal, total
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,0),COALESCE($10,0))
    RETURNING *
    `,
    [
      doc_no,
      branch_id,
      payload.client_id,
      payload.user_id || null,
      customer_id || null,
      customer_name || null,
      customer_phone || null,
      payment_method || "EFECTIVO",
      subtotal || 0,
      total || 0
    ]
  );

  return rows[0];
}

export async function addItem(client, { sale_id, product_id, qty, unit_price, client_id }) {
  const { rows } = await client.query(
    `
    INSERT INTO sale_items (sale_id, product_id, qty, unit_price, client_id)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [sale_id, product_id, qty, unit_price, client_id]
  );
  return rows[0];
}

export async function updateTotals(client, sale_id, client_id) {
  const { rows } = await client.query(
    `
    UPDATE sales s
    SET subtotal = t.subtotal,
        total = t.total,
        updated_at = NOW()
    FROM (
      SELECT si.sale_id,
             SUM(si.qty * si.unit_price)::numeric(10,2) AS subtotal,
             SUM(si.qty * si.unit_price)::numeric(10,2) AS total
      FROM sale_items si
      WHERE si.sale_id = $1 AND si.client_id = $2
      GROUP BY si.sale_id
    ) t
    WHERE s.id = t.sale_id AND s.client_id = $2
    RETURNING s.*
    `,
    [sale_id, client_id]
  );
  return rows[0];
}

export async function setPosted(client, sale_id, client_id) {
  const { rows } = await client.query(
    `
    UPDATE sales
    SET status = 'posted', posted_at = NOW()
    WHERE id = $1 AND client_id = $2
    RETURNING *
    `,
    [sale_id, client_id]
  );
  return rows[0];
}

export async function setOpen(client, sale_id, client_id) {
  const { rows } = await client.query(
    `
    UPDATE sales
    SET status = 'open', posted_at = NULL
    WHERE id = $1 AND client_id = $2
    RETURNING *
    `,
    [sale_id, client_id]
  );
  return rows[0];
}
