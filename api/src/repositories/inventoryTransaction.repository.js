import pool from "../config/db.js";

/**
 * Utilidad interna para ejecutar queries con o sin cliente transaccional.
 * Si se pasa un `client`, lo usa; si no, usa el `pool` normal.
 */
function getExecutor(client) {
  return client || pool;
}

/**
 * 🧾 Listar movimientos (opcionalmente por sucursal o producto)
 */
export async function findAll({ branch_id, product_id } = {}, client = null) {
  const filters = [];
  const params = [];

  if (branch_id) {
    params.push(branch_id);
    filters.push(`t.branch_id = $${params.length}`);
  }

  if (product_id) {
    params.push(product_id);
    filters.push(`t.product_id = $${params.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const executor = getExecutor(client);

  const { rows } = await executor.query(
    `
    SELECT t.*, 
           b.name AS branch_name,
           p.name AS product_name,
           p.sku
    FROM inventory_transactions t
    JOIN branches b ON b.id = t.branch_id
    JOIN products p ON p.id = t.product_id
    ${where}
    ORDER BY t.created_at DESC
    `,
    params
  );

  return rows;
}

/**
 * 🔍 Buscar un movimiento por ID
 */
export async function findById(id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(
    `
    SELECT t.*, 
           b.name AS branch_name, 
           p.name AS product_name
    FROM inventory_transactions t
    JOIN branches b ON b.id = t.branch_id
    JOIN products p ON p.id = t.product_id
    WHERE t.id = $1
    `,
    [id]
  );
  return rows[0];
}

/**
 * ➕ Crear un movimiento (entrada o salida)
 */
export async function create(
  { branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id },
  client = null
) {
  const executor = getExecutor(client);

  const { rows } = await executor.query(
    `
    INSERT INTO inventory_transactions 
      (branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [branch_id, product_id, type, qty, unit_cost, note, ref_type, ref_id]
  );

  return rows[0];
}

/**
 * 🗑️ Eliminar un movimiento por ID
 */
export async function remove(id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(
    "DELETE FROM inventory_transactions WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0];
}

/**
 * ❌ Eliminar movimientos relacionados por referencia (ej. al eliminar una compra o venta)
 */
export async function removeByRef(ref_type, ref_id, client = null) {
  const executor = getExecutor(client);
  await executor.query(
    "DELETE FROM inventory_transactions WHERE ref_type=$1 AND ref_id=$2",
    [ref_type, ref_id]
  );
  return true;
}

/**
 * 📦 Obtener stock actual (por producto y sucursal)
 */
export async function getCurrentStock(branch_id, product_id, client = null) {
  const executor = getExecutor(client);
  const { rows } = await executor.query(
    `
    SELECT 
      COALESCE(SUM(
        CASE 
          WHEN type IN ('PURCHASE','ADJUSTMENT_IN','TRANSFER_IN') THEN qty
          ELSE -qty 
        END
      ),0) AS stock
    FROM inventory_transactions
    WHERE branch_id = $1 AND product_id = $2
    `,
    [branch_id, product_id]
  );
  return rows[0]?.stock || 0;
}
