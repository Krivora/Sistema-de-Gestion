// src/repositories/permission.repository.js
import pool from "../config/db.js";

export async function getAllPermissions() {
  const { rows } = await pool.query(
    `SELECT id, key, description FROM permissions ORDER BY key ASC`
  );
  return rows;
}
