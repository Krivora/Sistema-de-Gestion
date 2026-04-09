import pool from "../../config/db.js";

const ALLOWED_ACTIONS = ["create", "update", "delete", "login", "logout"]; // ajusta a tus acciones reales

export async function findAll(clientId, { user_id, action, date_from, date_to } = {}) {
  const conds = ["a.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (user_id) {
    const parsed = parseInt(user_id, 10);
    if (!isNaN(parsed)) { conds.push(`a.user_id = $${i++}`); params.push(parsed); }
  }

  // Whitelist de actions — evita filtrar por valores arbitrarios
  if (action && ALLOWED_ACTIONS.includes(action)) {
    conds.push(`a.action = $${i++}`);
    params.push(action);
  }

  if (date_from) {
    const d = new Date(date_from);
    if (!isNaN(d)) { conds.push(`a.created_at >= $${i++}`); params.push(d); }
  }

  if (date_to) {
    const d = new Date(date_to);
    if (!isNaN(d)) { conds.push(`a.created_at < $${i++}`); params.push(d); }
  }

  const { rows } = await pool.query(
    `SELECT a.id, a.action, a.description, a.ref_table, a.ref_id, a.created_at,
            u.name AS user_name
     FROM activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE ${conds.join(" AND ")}
     ORDER BY a.id DESC
     LIMIT 500`,
    params
  );
  return rows;
}