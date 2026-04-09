import pool from "../../config/db.js";

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT u.*, r.name AS role_name, r.id AS role_id,
            c.id AS client_id, c.name AS client_name,
            c.business_name, c.logo_url
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     LEFT JOIN clients c ON c.id = u.client_id
     WHERE u.email = $1`,
    [email]
  );
  return rows[0] ?? null;
}