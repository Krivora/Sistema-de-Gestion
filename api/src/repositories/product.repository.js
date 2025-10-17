import pool from "../config/db.js";

export async function findAll() {
  const { rows } = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY LOWER(p.name) ASC
  `);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = $1
    `,
    [id]
  );
  return rows[0];
}

// 🔹 Crear producto
export async function create({ sku, name, description, category_id }) {
  let finalSku = sku;

  // Si no se proporciona SKU, generarlo automáticamente
  if (!finalSku) {
    // Obtener prefijo de la categoría
    let prefix = "GEN"; // Default si la categoría no existe
    if (category_id) {
      const { rows: catRows } = await pool.query(
        "SELECT name FROM categories WHERE id = $1",
        [category_id]
      );
      if (catRows.length > 0) {
        prefix = catRows[0].name
          .trim()
          .substring(0, 3)
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // elimina acentos
      }
    }

    // Contar cuántos productos existen con ese prefijo
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS total FROM products WHERE sku ILIKE $1",
      [`${prefix}-%`]
    );
    const count = rows[0].total + 1;

    // Formato: PREFIX-0001
    finalSku = `${prefix}-${String(count).padStart(4, "0")}`;
  }

  const { rows } = await pool.query(
    `INSERT INTO products (sku, name, description, category_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [finalSku, name, description, category_id]
  );
  return rows[0];
}
// 🔹 Actualizar
export async function update(id, { sku, name, description, category_id, is_active }) {
  const { rows } = await pool.query(
    `
    UPDATE products
    SET sku = $1,
        name = $2,
        description = $3,
        category_id = $4,
        is_active = $5,
        updated_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
    [sku, name, description, category_id, is_active, id]
  );
  return rows[0];
}

// 🔹 Inhabilitar
export async function deactivate(id) {
  const { rows } = await pool.query(
    `UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
}

// 🔹 Habilitar
export async function activate(id) {
  const { rows } = await pool.query(
    `UPDATE products SET is_active = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
}

// 🚫 Eliminación física
export async function remove(id) {
  const { rows } = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0];
}