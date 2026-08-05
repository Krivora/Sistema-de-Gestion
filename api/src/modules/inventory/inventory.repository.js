import pool from "../../config/db.js";

const VALID_TYPES = ["PURCHASE", "SALE", "ADJUSTMENT_IN", "ADJUSTMENT_OUT", "TRANSFER_IN", "TRANSFER_OUT"];
const IN_TYPES    = new Set(["PURCHASE", "ADJUSTMENT_IN", "TRANSFER_IN"]);
const OUT_TYPES   = new Set(["SALE", "ADJUSTMENT_OUT", "TRANSFER_OUT"]);

export async function findAll(clientId, filters = {}) {
  const conds = ["it.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (filters.branch_id) {
    const v = parseInt(filters.branch_id, 10);
    if (!isNaN(v)) { conds.push(`it.branch_id = $${i++}`); params.push(v); }
  }
  if (filters.product_id) {
    const v = parseInt(filters.product_id, 10);
    if (!isNaN(v)) { conds.push(`it.product_id = $${i++}`); params.push(v); }
  }
  if (filters.type && VALID_TYPES.includes(filters.type)) {
    conds.push(`it.type = $${i++}`); params.push(filters.type);
  }
  if (filters.date_from) {
    const d = new Date(filters.date_from);
    if (!isNaN(d)) { conds.push(`it.created_at >= $${i++}`); params.push(d); }
  }
  if (filters.date_to) {
    const d = new Date(filters.date_to);
    if (!isNaN(d)) { conds.push(`it.created_at < $${i++}`); params.push(d); }
  }

  const { rows } = await pool.query(
    `SELECT it.id, it.type, it.qty, it.unit_cost, it.note,
            it.ref_type, it.ref_id, it.created_at,
            b.name AS branch_name, p.name AS product_name, p.sku
     FROM inventory_transactions it
     JOIN branches b ON b.id = it.branch_id
     JOIN products p ON p.id = it.product_id
     WHERE ${conds.join(" AND ")}
     ORDER BY it.created_at DESC
     LIMIT 1000`,
    params
  );
  return rows;
}

export async function create(trx, data) {
  if (!VALID_TYPES.includes(data.type))
    throw Object.assign(new Error(`Tipo de transacción inválido: ${data.type}`), { status: 400 });

  const { rows } = await trx.query(
    `INSERT INTO inventory_transactions
       (branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id, client_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [data.branch_id, data.product_id, data.type, data.qty,
     data.unit_cost ?? 0, data.note ?? null,
     data.ref_type ?? null, data.ref_id ?? null, data.client_id]
  );
  return rows[0];
}

export async function getBranchStock(trx, branchId, productId, clientId, forUpdate = false) {
  const { rows } = await trx.query(
    `SELECT stock FROM branch_products
     WHERE branch_id=$1 AND product_id=$2 AND client_id=$3
     ${forUpdate ? "FOR UPDATE" : ""}`,
    [branchId, productId, clientId]
  );
  return Number(rows[0]?.stock ?? 0);
}

export async function updateBranchStock(trx, branchId, productId, newStock, clientId) {
  await trx.query(
    `UPDATE branch_products SET stock=$1, updated_at=NOW()
     WHERE branch_id=$2 AND product_id=$3 AND client_id=$4`,
    [newStock, branchId, productId, clientId]
  );
}

export async function validateBranchProduct(trx, branchId, productId, clientId) {
  const { rowCount } = await trx.query(
    `SELECT 1 FROM branch_products
     WHERE branch_id=$1 AND product_id=$2 AND client_id=$3`,
    [branchId, productId, clientId]
  );
  if (!rowCount) throw Object.assign(
    new Error(`Producto ${productId} no configurado en sucursal ${branchId}`),
    { status: 400 }
  );
}

export async function applyStockChange(trx, branchId, productId, qty, type, clientId) {
  const current = await getBranchStock(trx, branchId, productId, clientId, true);
  let newStock = current;

  if (IN_TYPES.has(type)) {
    newStock += Number(qty);
  } else if (OUT_TYPES.has(type)) {
    if (current < qty) throw Object.assign(
      new Error(`Stock insuficiente para producto ${productId} (disponible: ${current})`),
      { status: 400 }
    );
    newStock -= Number(qty);
  } else {
    throw Object.assign(new Error(`Tipo de transacción inválido: ${type}`), { status: 400 });
  }

  await updateBranchStock(trx, branchId, productId, newStock, clientId);
  return newStock;
}

export async function logActivity(trx, userId, clientId, action, description, refTable, refId) {
  await trx.query(
    `INSERT INTO activity_logs (user_id, client_id, action, description, ref_table, ref_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, clientId, action, description, refTable ?? null, refId ?? null]
  );
}

export async function createAndApply(trx, data, clientId, userId) {
  await validateBranchProduct(trx, data.branch_id, data.product_id, clientId);
  const tx = await create(trx, { ...data, client_id: clientId });
  const newStock = await applyStockChange(trx, data.branch_id, data.product_id, data.qty, data.type, clientId);

  await logActivity(trx, userId, clientId,
    `INVENTORY_${data.type}`,
    `${data.type}: ${data.qty} uds. producto #${data.product_id}`,
    "inventory_transactions", tx.id
  );

  return { ...tx, new_stock: newStock };
}