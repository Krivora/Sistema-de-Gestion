import pool from "../../config/db.js";

const ALLOWED_UPDATE_FIELDS = [
  "name", "business_name", "logo_url", "email",
  "phone", "max_users", "max_branches", "is_active"
];

/**
 * Un cliente está moroso si alguno de sus cortes ya vencidos no tiene pago.
 * El ciclo es mensual desde la fecha de alta; Postgres ajusta los meses cortos
 * al sumar intervalos (alta el 31-ene => corte el 28-feb).
 *
 * Se expone como fragmento para que la verificación al iniciar sesión y el
 * barrido del tablero usen exactamente la misma definición.
 */
const IS_DELINQUENT = `
  EXISTS (
    SELECT 1
    FROM generate_series(
      1,
      GREATEST((DATE_PART('year',  AGE(CURRENT_DATE, c.created_at::date)) * 12
              + DATE_PART('month', AGE(CURRENT_DATE, c.created_at::date)))::int, 0)
    ) k
    CROSS JOIN LATERAL (
      SELECT (c.created_at::date + (k || ' months')::interval)::date AS due
    ) d
    WHERE NOT EXISTS (
      SELECT 1 FROM client_payments p
      WHERE p.client_id = c.id AND p.due_date = d.due
    )
  )`;

/** Estado de cobranza de un cliente: alimenta el bloqueo y el aviso de pago. */
export async function findBillingStatus(clientId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.is_active, c.suspended_for_payment,
            TO_CHAR(c.grace_until, 'YYYY-MM-DD') AS grace_until,
            ${IS_DELINQUENT} AS is_delinquent,
            (c.grace_until IS NOT NULL AND c.grace_until >= CURRENT_DATE) AS has_grace,
            pend.pending_cycles,
            pend.oldest_unpaid_due
     FROM clients c
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS pending_cycles,
              TO_CHAR(MIN(d.due), 'YYYY-MM-DD') AS oldest_unpaid_due
       FROM generate_series(
         1,
         GREATEST((DATE_PART('year',  AGE(CURRENT_DATE, c.created_at::date)) * 12
                 + DATE_PART('month', AGE(CURRENT_DATE, c.created_at::date)))::int, 0)
       ) k
       CROSS JOIN LATERAL (
         SELECT (c.created_at::date + (k || ' months')::interval)::date AS due
       ) d
       WHERE NOT EXISTS (
         SELECT 1 FROM client_payments p
         WHERE p.client_id = c.id AND p.due_date = d.due
       )
     ) pend ON TRUE
     WHERE c.id = $1`,
    [clientId]
  );
  return rows[0] ?? null;
}

/**
 * Desactiva de un jalón a los clientes con cortes vencidos sin pagar y sin
 * prórroga vigente. Marca `suspended_for_payment` para no revivir después a
 * quien el superadmin apagó a mano.
 */
export async function suspendDelinquentClients() {
  const { rows } = await pool.query(
    `UPDATE clients c
     SET is_active = FALSE, suspended_for_payment = TRUE, updated_at = NOW()
     WHERE c.is_active = TRUE
       AND (c.grace_until IS NULL OR c.grace_until < CURRENT_DATE)
       AND ${IS_DELINQUENT}
     RETURNING c.id, c.name`
  );
  return rows;
}

/** Prórroga manual: reactiva y protege hasta la fecha dada. La deuda se queda. */
export async function setGrace(clientId, graceUntil) {
  const { rows } = await pool.query(
    `UPDATE clients
     SET grace_until = $2, is_active = TRUE, suspended_for_payment = FALSE, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, is_active, grace_until`,
    [clientId, graceUntil]
  );
  return rows[0] ?? null;
}

/** Cancela la prórroga. La suspensión, si aplica, la ejecuta el barrido. */
export async function clearGrace(clientId) {
  const { rows } = await pool.query(
    `UPDATE clients SET grace_until = NULL, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, is_active, grace_until`,
    [clientId]
  );
  return rows[0] ?? null;
}

/**
 * Tras registrar un pago: si ya no debe nada y había sido suspendido por el
 * sistema, se reactiva solo. No toca a quien fue desactivado manualmente.
 */
export async function reactivateIfSettled(clientId) {
  const { rows } = await pool.query(
    `UPDATE clients c
     SET is_active = TRUE, suspended_for_payment = FALSE, updated_at = NOW()
     WHERE c.id = $1
       AND c.suspended_for_payment = TRUE
       AND NOT ${IS_DELINQUENT}
     RETURNING c.id, c.name`,
    [clientId]
  );
  return rows[0] ?? null;
}

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT id, code, name, business_name, logo_url,
            max_users, max_branches, email, phone, is_active, created_at
     FROM clients ORDER BY id ASC`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, code, name, business_name, logo_url,
            max_users, max_branches, email, phone, is_active, created_at
     FROM clients WHERE id=$1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ code, name, business_name, logo_url, email, phone, max_users, max_branches }, trxClient = null) {
  const db = trxClient ?? pool;
  const { rows } = await db.query(
    `INSERT INTO clients (code, name, business_name, logo_url, email, phone, max_users, max_branches)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [code, name, business_name ?? null, logo_url ?? null, email ?? null, phone ?? null, max_users ?? 5, max_branches ?? 1]
  );
  return rows[0];
}

export async function update(id, data) {
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  if (!Object.keys(filtered).length) return null;

  const fields = Object.keys(filtered).map((k, i) => `${k} = $${i + 1}`);
  const values = Object.values(filtered);

  const { rows } = await pool.query(
    `UPDATE clients SET ${fields.join(", ")}, updated_at=NOW()
     WHERE id=$${values.length + 1} RETURNING *`,
    [...values, id]
  );
  return rows[0] ?? null;
}

// Acción explícita — no toggle
export async function setActive(id, isActive) {
  const { rows } = await pool.query(
    `UPDATE clients SET is_active=$1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [isActive, id]
  );
  return rows[0] ?? null;
}

export async function findLastCode() {
  const { rows } = await pool.query(
    `SELECT code FROM clients WHERE code ILIKE 'CLI-%'
     ORDER BY id DESC LIMIT 1`
  );
  return rows[0]?.code ?? null;
}