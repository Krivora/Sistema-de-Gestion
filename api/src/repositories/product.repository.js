import pool from "../config/db.js";

export async function findAll(clientId = null) {
  const query = clientId
    ? `
      SELECT 
        p.*, 
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.client_id = $1
        AND p.status = 'active' 
        OR P.status = 'inactive'
     ORDER BY p.status ASC, p.name ASC
    `
    : `
      SELECT 
        p.*, 
        c.name AS category_name,
        cl.name AS client_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN clients cl ON cl.id = p.client_id
      WHERE p.status = 'active'
      OR P.status = 'inactive' 
     ORDER BY p.status ASC, p.name ASC
    `;

  const { rows } = await pool.query(query, clientId ? [clientId] : []);
  return rows;
}

// 🧩 Buscar por ID (solo activos)
export async function findById(id, clientId = null) {
  const query = clientId
    ? `
        SELECT *
        FROM products
        WHERE id = $1
          AND client_id = $2
          AND status = 'active'         -- 👈 Solo si está activo
      `
    : `
        SELECT *
        FROM products
        WHERE id = $1
          AND status = 'active'         -- 👈 Solo si está activo
      `;

  const { rows } = await pool.query(query, clientId ? [id, clientId] : [id]);
  return rows[0];
}


// 🧩 Crear producto
export async function create({ sku, name, description, category_id, client_id }) {
  let finalSku = sku;

  // Si no se proporciona SKU, generarlo automáticamente
  if (!finalSku) {
    let prefix = "GEN"; // Default si no hay categoría

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

  // ✅ Ahora sí, el INSERT fuera del if
  const { rows } = await pool.query(
    `
    INSERT INTO products (sku, name, description, category_id, client_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [finalSku, name, description, category_id, client_id]
  );

  return rows[0];
}

// 🧩 Actualizar
export async function update(id, clientId, data) {
  const fields = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${i++}`);
    values.push(value);
  }
  const query = `
    UPDATE products
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${i} AND client_id = $${i + 1}
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [...values, id, clientId]);
  return rows[0];
}

export async function updateProductStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE products
     SET status = $2::status_enum,
         deleted_at = CASE WHEN $2 = 'deleted' THEN NOW() ELSE NULL END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );
  return rows[0];
}

// Wrappers para mantener consistencia
export async function activate(id) {
  return await updateProductStatus(id, "active");
}

export async function desactivate(id) {
  return await updateProductStatus(id, "inactive");
}

export async function deleted(id) {
  return await updateProductStatus(id, "deleted");
}