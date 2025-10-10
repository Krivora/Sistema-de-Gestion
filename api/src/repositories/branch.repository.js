import pool from "../config/db.js";

// 🔹 Listar todas las sucursales
export async function findAll() {
  const { rows } = await pool.query("SELECT * FROM branches ORDER BY id");
  return rows;
}

// 🔹 Buscar por ID
export async function findById(id) {
  const { rows } = await pool.query("SELECT * FROM branches WHERE id = $1", [id]);
  return rows[0];
}

// 🔹 Crear sucursal con código automático
export async function create({ code, name, address, phone, is_active = true }) {
  let finalCode = code;

  // Si no se envía código, lo generamos automáticamente
  if (!finalCode) {
    const prefix = name
      .trim()
      .substring(0, 3)
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // elimina acentos

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM branches WHERE code ILIKE $1`,
      [`${prefix}%`]
    );
    const count = rows[0].total + 1;

    finalCode = `${prefix}-${String(count).padStart(3, "0")}`;
  }

  const { rows } = await pool.query(
    `INSERT INTO branches (code, name, address, phone, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [finalCode, name, address, phone, is_active]
  );
  return rows[0];
}

// 🔹 Actualizar sucursal
export async function update(id, { code, name, address, phone, is_active }) {
  const { rows } = await pool.query(
    `UPDATE branches 
     SET code=$1, name=$2, address=$3, phone=$4, is_active=$5, updated_at=NOW()
     WHERE id=$6
     RETURNING *`,
    [code, name, address, phone, is_active, id]
  );
  return rows[0];
}

// 🔹 Eliminar sucursal
export async function remove(id) {
  const { rows } = await pool.query(
    "DELETE FROM branches WHERE id=$1 RETURNING *",
    [id]
  );
  return rows[0];
}

// 🔹 Cambiar estado (activar/desactivar)
export async function toggleStatus(id, newStatus) {
  const { rows } = await pool.query(
    `UPDATE branches
     SET is_active = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [newStatus, id]
  );
  return rows[0];
}
