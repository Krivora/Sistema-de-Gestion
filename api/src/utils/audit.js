import pool from "../config/db.js";

export async function logAction({ client_id, user_id, action, description, ref_table, ref_id }) {
  try {
    await pool.query(
      `INSERT INTO activity_logs (client_id, user_id, action, description, ref_table, ref_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [client_id, user_id, action, description || null, ref_table || null, ref_id || null]
    );
  } catch (e) {
    // No rompas el flujo por error de log
    console.error("[activity_logs] error:", e.message);
  }
}
