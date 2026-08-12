import pool from "../../config/db.js";

const VALID_STATUSES = ["open", "posted", "cancelled"];
const VALID_PAYMENT_METHODS = ["EFECTIVO", "TARJETA", "TRANSFERENCIA", "OTRO"];

const MAX_PAGE_SIZE = 200;

/**
 * Listado paginado en el servidor.
 *
 * La búsqueda también vive aquí: si se filtrara en el cliente solo buscaría
 * dentro de la página cargada, y el usuario creería que un folio no existe
 * cuando simplemente está en otra página.
 *
 * Devuelve { data, total } — `total` es el conteo con los filtros aplicados,
 * para que la interfaz sepa cuántas páginas hay y nunca trunque en silencio.
 */
export async function findAll(clientId, { status, branch_id, date_from, date_to, q, page = 1, page_size = 25 } = {}) {
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
  if (q && String(q).trim()) {
    conds.push(`(
      s.doc_no ILIKE $${i} OR
      COALESCE(c.name, s.customer_name) ILIKE $${i} OR
      b.name ILIKE $${i} OR
      u.name ILIKE $${i}
    )`);
    params.push(`%${String(q).trim()}%`);
    i++;
  }

  const FROM = `
     FROM sales s
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN users u ON u.id = s.user_id
     LEFT JOIN customers c ON c.id = s.customer_id`;
  const WHERE = `WHERE ${conds.join(" AND ")}`;

  const size = Math.min(Math.max(parseInt(page_size, 10) || 25, 1), MAX_PAGE_SIZE);
  const current = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (current - 1) * size;

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query(
      `SELECT s.id, s.doc_no, s.status, s.payment_method,
              s.subtotal, s.total, s.posted_at, s.created_at, s.branch_id,
              s.payment_type,
              COALESCE(pay.paid_amount, 0)::float8 AS paid_amount,
              COALESCE(ret.returned_total, 0)::float8 AS returned_total,
              -- Lo devuelto que se aplicó a la deuda (credited) también la baja
              (s.total - COALESCE(pay.paid_amount, 0) - COALESCE(ret.credited, 0))::float8 AS balance,
              b.name AS branch_name, u.name AS user_name,
              COALESCE(c.name, s.customer_name) AS customer_name,
              COALESCE(c.phone, s.customer_phone) AS customer_phone,
              c.email AS customer_email
       ${FROM}
       LEFT JOIN LATERAL (
         SELECT SUM(sp.amount) AS paid_amount FROM sale_payments sp
         WHERE sp.sale_id = s.id
       ) pay ON TRUE
       LEFT JOIN LATERAL (
         SELECT SUM(r.total) AS returned_total, SUM(r.credited) AS credited
         FROM sale_returns r WHERE r.sale_id = s.id
       ) ret ON TRUE
       ${WHERE}
       ORDER BY s.id DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, size, offset]
    ),
    pool.query(`SELECT COUNT(*)::int AS total ${FROM} ${WHERE}`, params),
  ]);

  return { data: rows, total: countRows[0].total, page: current, page_size: size };
}

export async function findById(id, clientId) {
  const { rows } = await pool.query(
    `SELECT s.id, s.doc_no, s.status, s.payment_method, s.subtotal, s.total,
            s.branch_id, s.customer_id, s.customer_name, s.customer_phone,
            s.payment_type, s.inventory_applied,
            COALESCE(pay.paid_amount, 0)::float8 AS paid_amount,
            COALESCE(ret.returned_total, 0)::float8 AS returned_total,
            (s.total - COALESCE(pay.paid_amount, 0) - COALESCE(ret.credited, 0))::float8 AS balance,
            s.cancelled_at, s.cancel_reason,
            s.posted_at, s.created_at,
            b.name AS branch_name, b.code AS branch_code,
            u.name AS user_name, c.name AS customer_name_full
     FROM sales s
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN users u ON u.id = s.user_id
     LEFT JOIN customers c ON c.id = s.customer_id
     LEFT JOIN LATERAL (
       SELECT SUM(sp.amount) AS paid_amount FROM sale_payments sp
       WHERE sp.sale_id = s.id
     ) pay ON TRUE
     LEFT JOIN LATERAL (
       SELECT SUM(r.total) AS returned_total, SUM(r.credited) AS credited
       FROM sale_returns r WHERE r.sale_id = s.id
     ) ret ON TRUE
     WHERE s.id=$1 AND s.client_id=$2`,
    [id, clientId]
  );
  return rows[0] ?? null;
}

export async function findItems(saleId, clientId) {
  const { rows } = await pool.query(
    `SELECT si.id, si.product_id, si.qty, si.unit_price, si.sale_package_id,
            p.name AS product_name, p.sku
     FROM sale_items si
     JOIN products p ON p.id = si.product_id
     WHERE si.sale_id=$1 AND si.client_id=$2
     ORDER BY si.id ASC`,
    [saleId, clientId]
  );
  return rows;
}

/* ── Paquetes vendidos ────────────────────────────────────────── */

/**
 * Los paquetes de una venta. Sus productos siguen en sale_items apuntando aquí
 * con `sale_package_id`, así que esto es solo la cabecera para agruparlos y
 * mostrar el precio que se cobró por el paquete completo.
 */
export async function findSalePackages(saleId, clientId) {
  const { rows } = await pool.query(
    `SELECT sp.id, sp.package_id, sp.name, sp.qty::float8 AS qty,
            sp.unit_price::float8 AS unit_price,
            (sp.qty * sp.unit_price)::float8 AS total,
            pk.code AS package_code, pk.kind AS package_kind
     FROM sale_packages sp
     LEFT JOIN packages pk ON pk.id = sp.package_id
     WHERE sp.sale_id=$1 AND sp.client_id=$2
     ORDER BY sp.id ASC`,
    [saleId, clientId]
  );
  return rows;
}

export async function createSalePackage(trx, { sale_id, package_id, client_id, name, qty, unit_price }) {
  const { rows } = await trx.query(
    `INSERT INTO sale_packages (sale_id, package_id, client_id, name, qty, unit_price)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [sale_id, package_id ?? null, client_id, name, qty, unit_price]
  );
  return rows[0];
}

export async function deleteSalePackages(trx, saleId, clientId) {
  await trx.query(
    `DELETE FROM sale_packages WHERE sale_id=$1 AND client_id=$2`,
    [saleId, clientId]
  );
}

/** Precios de lista de la sucursal, para repartir el precio del paquete. */
export async function findBranchPrices(db, branchId, productIds, clientId) {
  if (!productIds.length) return new Map();
  const { rows } = await db.query(
    `SELECT product_id, price::float8 AS price
     FROM branch_products
     WHERE branch_id=$1 AND client_id=$2 AND product_id = ANY($3::int[])`,
    [branchId, clientId, productIds]
  );
  return new Map(rows.map((r) => [r.product_id, r.price]));
}

/**
 * Cuentas por cobrar: ventas a abonos con saldo, agrupables por cliente.
 * `days_since` mide desde el último movimiento de dinero — el último abono si
 * hubo, o la fecha de la venta si nunca ha pagado nada.
 */
export async function findReceivables(clientId, { branch_id } = {}) {
  const conds = [
    "s.client_id = $1",
    "s.payment_type = 'credito'",
    "s.status <> 'cancelled'",
  ];
  const params = [clientId];
  let i = 2;

  if (branch_id) {
    const v = parseInt(branch_id, 10);
    if (!isNaN(v)) { conds.push(`s.branch_id = $${i++}`); params.push(v); }
  }

  const { rows } = await pool.query(
    `SELECT s.id, s.doc_no, s.created_at, s.total::float8 AS total,
            s.customer_id,
            COALESCE(c.name, s.customer_name) AS customer_name,
            COALESCE(c.phone, s.customer_phone) AS customer_phone,
            b.name AS branch_name,
            COALESCE(pay.paid_amount, 0)::float8 AS paid_amount,
            (s.total - COALESCE(pay.paid_amount, 0) - COALESCE(ret.credited, 0))::float8 AS balance,
            pay.last_payment_at,
            EXTRACT(DAY FROM NOW() - COALESCE(pay.last_payment_at, s.created_at))::int AS days_since
     FROM sales s
     LEFT JOIN customers c ON c.id = s.customer_id
     LEFT JOIN branches b ON b.id = s.branch_id
     LEFT JOIN LATERAL (
       SELECT SUM(sp.amount) AS paid_amount, MAX(sp.paid_at) AS last_payment_at
       FROM sale_payments sp WHERE sp.sale_id = s.id
     ) pay ON TRUE
     LEFT JOIN LATERAL (
       SELECT SUM(r.credited) AS credited FROM sale_returns r WHERE r.sale_id = s.id
     ) ret ON TRUE
     WHERE ${conds.join(" AND ")}
       AND (s.total - COALESCE(pay.paid_amount, 0) - COALESCE(ret.credited, 0)) > 0.009
     ORDER BY days_since DESC, balance DESC`,
    params
  );
  return rows;
}

/* ── Cancelación ──────────────────────────────────────────── */

export async function setCancelled(trx, saleId, clientId, reason) {
  const { rows } = await trx.query(
    `UPDATE sales SET status='cancelled', cancelled_at=NOW(), cancel_reason=$3, updated_at=NOW()
     WHERE id=$1 AND client_id=$2 AND status <> 'cancelled'
     RETURNING *`,
    [saleId, clientId, reason ?? null]
  );
  return rows[0] ?? null;
}

/* ── Devoluciones ─────────────────────────────────────────── */

/**
 * Renglones de la venta con lo ya devuelto, para saber cuánto queda disponible.
 * Sin esto se podría devolver más piezas de las que se vendieron.
 */
export async function findItemsWithReturned(saleId, clientId) {
  const { rows } = await pool.query(
    `SELECT si.id, si.product_id, si.qty::float8 AS qty, si.unit_price::float8 AS unit_price,
            si.sale_package_id, sp.name AS package_name,
            p.name AS product_name, p.sku,
            COALESCE(r.returned, 0)::float8 AS returned_qty,
            (si.qty - COALESCE(r.returned, 0))::float8 AS returnable_qty
     FROM sale_items si
     JOIN products p ON p.id = si.product_id
     LEFT JOIN sale_packages sp ON sp.id = si.sale_package_id
     LEFT JOIN LATERAL (
       SELECT SUM(ri.qty) AS returned FROM sale_return_items ri
       WHERE ri.sale_item_id = si.id
     ) r ON TRUE
     WHERE si.sale_id=$1 AND si.client_id=$2
     ORDER BY si.id ASC`,
    [saleId, clientId]
  );
  return rows;
}

export async function findReturns(saleId, clientId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.sale_id, r.total::float8 AS total, r.credited::float8 AS credited,
            r.refunded::float8 AS refunded, r.reason, r.created_at,
            u.name AS registered_by,
            COALESCE(json_agg(json_build_object(
              'product_name', p.name, 'sku', p.sku,
              'qty', ri.qty::float8, 'unit_price', ri.unit_price::float8
            ) ORDER BY ri.id) FILTER (WHERE ri.id IS NOT NULL), '[]') AS items
     FROM sale_returns r
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN sale_return_items ri ON ri.return_id = r.id
     LEFT JOIN products p ON p.id = ri.product_id
     WHERE r.sale_id=$1 AND r.client_id=$2
     GROUP BY r.id, u.name
     ORDER BY r.created_at DESC`,
    [saleId, clientId]
  );
  return rows;
}

export async function createReturn(trx, { sale_id, client_id, branch_id, total, credited, refunded, reason, user_id }) {
  const { rows } = await trx.query(
    `INSERT INTO sale_returns (sale_id, client_id, branch_id, total, credited, refunded, reason, user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, sale_id, total::float8 AS total, credited::float8 AS credited,
               refunded::float8 AS refunded, reason, created_at`,
    [sale_id, client_id, branch_id, total, credited, refunded, reason ?? null, user_id ?? null]
  );
  return rows[0];
}

export async function addReturnItem(trx, { return_id, sale_item_id, product_id, qty, unit_price, client_id }) {
  await trx.query(
    `INSERT INTO sale_return_items (return_id, sale_item_id, product_id, qty, unit_price, client_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [return_id, sale_item_id, product_id, qty, unit_price, client_id]
  );
}

/** Total devuelto de una venta, para restarlo de lo que el cliente debe. */
export async function getReturnedTotal(db, saleId, clientId) {
  const { rows } = await db.query(
    `SELECT COALESCE(SUM(total), 0)::float8 AS t FROM sale_returns
     WHERE sale_id=$1 AND client_id=$2`,
    [saleId, clientId]
  );
  return rows[0].t;
}

/* ── Abonos ───────────────────────────────────────────────── */

export async function findPayments(saleId, clientId) {
  const { rows } = await pool.query(
    `SELECT sp.id, sp.sale_id, sp.amount::float8 AS amount, sp.method,
            sp.note, sp.paid_at, u.name AS registered_by
     FROM sale_payments sp
     LEFT JOIN users u ON u.id = sp.user_id
     WHERE sp.sale_id = $1 AND sp.client_id = $2
     ORDER BY sp.paid_at ASC, sp.id ASC`,
    [saleId, clientId]
  );
  return rows;
}

export async function addPayment(db, { sale_id, client_id, amount, method, note, user_id }) {
  const { rows } = await db.query(
    `INSERT INTO sale_payments (sale_id, client_id, amount, method, note, user_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, sale_id, amount::float8 AS amount, method, note, paid_at`,
    [sale_id, client_id, amount, method, note ?? null, user_id ?? null]
  );
  return rows[0];
}

export async function deletePayment(id, saleId, clientId) {
  const { rows } = await pool.query(
    `DELETE FROM sale_payments WHERE id=$1 AND sale_id=$2 AND client_id=$3
     RETURNING id, amount::float8 AS amount, paid_at`,
    [id, saleId, clientId]
  );
  return rows[0] ?? null;
}

/** Marca que el inventario de esta venta ya salió, para no descontarlo dos veces. */
export async function setInventoryApplied(trx, saleId, clientId, applied) {
  await trx.query(
    `UPDATE sales SET inventory_applied=$3, updated_at=NOW()
     WHERE id=$1 AND client_id=$2`,
    [saleId, clientId, applied]
  );
}

export async function createHeader(trx, payload) {
  const { rows: seq } = await trx.query(`SELECT nextval('sales_doc_seq') AS seq`);
  const doc_no = payload.doc_no || `VT-${String(seq[0].seq).padStart(5, "0")}`;

  const payment = VALID_PAYMENT_METHODS.includes(payload.payment_method)
    ? payload.payment_method : "EFECTIVO";

  const payment_type = payload.payment_type === "credito" ? "credito" : "contado";

  const { rows } = await trx.query(
    `INSERT INTO sales
       (doc_no, branch_id, client_id, user_id, customer_id,
        customer_name, customer_phone, payment_method, payment_type, subtotal, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,0,0) RETURNING *`,
    [doc_no, payload.branch_id, payload.client_id, payload.user_id ?? null,
      payload.customer_id ?? null, payload.customer_name ?? null,
      payload.customer_phone ?? null, payment, payment_type]
  );
  return rows[0];
}

export async function updateHeader(trx, saleId, clientId, payload) {
  const payment = VALID_PAYMENT_METHODS.includes(payload.payment_method)
    ? payload.payment_method : "EFECTIVO";

  let rows;
  try {
    ({ rows } = await trx.query(
    `UPDATE sales
     SET branch_id      = $3,
         customer_id    = $4,
         customer_name  = $5,
         customer_phone = $6,
         payment_method = $7,
         doc_no         = COALESCE(NULLIF($8::text, ''), doc_no),
         updated_at     = NOW()
     WHERE id=$1 AND client_id=$2 AND status='open'
     RETURNING *`,
    [saleId, clientId, payload.branch_id,
      payload.customer_id ?? null, payload.customer_name ?? null,
      payload.customer_phone ?? null, payment, payload.doc_no ?? null]
    ));
  } catch (err) {
    if (err.code === "23505")
      throw Object.assign(new Error("Ya existe una venta con ese número de documento"), { status: 409 });
    throw err;
  }
  return rows[0] ?? null;
}

export async function deleteItems(trx, saleId, clientId) {
  await trx.query(
    `DELETE FROM sale_items WHERE sale_id=$1 AND client_id=$2`,
    [saleId, clientId]
  );
}

export async function addItem(trx, { sale_id, product_id, qty, unit_price, client_id, sale_package_id }) {
  const { rows } = await trx.query(
    `INSERT INTO sale_items (sale_id, product_id, qty, unit_price, client_id, sale_package_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [sale_id, product_id, qty, unit_price, client_id, sale_package_id ?? null]
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
export async function setOpen(trx, saleId, clientId) {
  const { rows } = await trx.query(
    `UPDATE sales SET status='open', posted_at=NULL, updated_at=NOW()
     WHERE id=$1 AND client_id=$2 AND status='posted' RETURNING *`,
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