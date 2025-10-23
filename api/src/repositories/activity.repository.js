import pool from "../config/db.js";

export async function findAll(clientId, { user_id, action, date_from, date_to } = {}) {
  const conds = ["a.client_id = $1"];
  const params = [clientId];
  let i = 2;

  if (user_id) { conds.push(`a.user_id = $${i++}`); params.push(user_id); }
  if (action) { conds.push(`a.action = $${i++}`); params.push(action); }
  if (date_from) { conds.push(`a.created_at >= $${i++}`); params.push(date_from); }
  if (date_to) { conds.push(`a.created_at < $${i++}`); params.push(date_to); }

  const { rows } = await pool.query(
    `
    SELECT a.*, u.name AS user_name
    FROM activity_logs a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE ${conds.join(" AND ")}
    ORDER BY a.id DESC
    `,
    params
  );
  return rows;
}
