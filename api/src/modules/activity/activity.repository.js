import pool from "../../config/db.js";

export async function findAll(filters = {}) {
  const {
    user_id, action, category, severity, status,
    ref_table, ref_id,
    from, to,
    limit = 50, offset = 0,
  } = filters;

  const conditions = [];
  const params = [];
  let i = 1;

  if (user_id)   { conditions.push(`a.user_id = $${i++}`);    params.push(user_id); }
  if (action)    { conditions.push(`a.action ILIKE $${i++}`); params.push(`%${action}%`); }
  if (category)  { conditions.push(`a.category = $${i++}`);   params.push(category); }
  if (severity)  { conditions.push(`a.severity = $${i++}`);   params.push(severity); }
  if (status)    { conditions.push(`a.status = $${i++}`);     params.push(status); }
  if (ref_table) { conditions.push(`a.ref_table = $${i++}`);  params.push(ref_table); }
  if (ref_id)    { conditions.push(`a.ref_id = $${i++}`);     params.push(ref_id); }
  if (from)      { conditions.push(`a.created_at >= $${i++}`);params.push(from); }
  if (to)        { conditions.push(`a.created_at <= $${i++}`);params.push(to); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query(
      `SELECT a.*, u.name AS user_name, u.email AS user_email
       FROM activity_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    ),
    pool.query(
      `SELECT COUNT(*) FROM activity_logs a ${where}`,
      params
    ),
  ]);

  return { data: rows, total: parseInt(countRows[0].count), limit, offset };
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS user_name, u.email AS user_email
     FROM activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function findByEntity(ref_table, ref_id) {
  const { rows } = await pool.query(
    `SELECT a.*, u.name AS user_name
     FROM activity_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.ref_table = $1 AND a.ref_id = $2
     ORDER BY a.created_at DESC`,
    [ref_table, ref_id]
  );
  return rows;
}

export async function getStats(from, to) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (from) { conditions.push(`created_at >= $${i++}`); params.push(from); }
  if (to)   { conditions.push(`created_at <= $${i++}`); params.push(to); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT
       category,
       severity,
       status,
       COUNT(*) AS total,
       COUNT(DISTINCT user_id) AS unique_users
     FROM activity_logs
     ${where}
     GROUP BY category, severity, status
     ORDER BY total DESC`,
    params
  );
  return rows;
}