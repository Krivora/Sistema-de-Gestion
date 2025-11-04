import pool from "../config/db.js";
import * as AdjustmentRepo from "../repositories/adjustment.repository.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import { INVENTORY_TYPES } from "../constants/inventoryTypes.js";

/**
 * 🧩 Crear y publicar un ajuste multiproducto
 * payload = { branch_id, note, items: [{ product_id, qty, type, note }] }
 */
export async function createAndPostAdjustment(payload, user) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { client_id, id: user_id } = user;
    const { branch_id, note, items } = payload;

    if (!items?.length) throw new Error("El ajuste requiere productos");

    // 1️⃣ Crear encabezado
    const adjustment = await AdjustmentRepo.createHeader(client, {
      branch_id,
      note,
      client_id,
      user_id,
    });

    // 2️⃣ Procesar cada producto
    for (const item of items) {
      const qty = Number(item.qty);
      if (!item.product_id || qty <= 0)
        throw new Error("Producto o cantidad inválida");

      if (![INVENTORY_TYPES.ADJUSTMENT_IN, INVENTORY_TYPES.ADJUSTMENT_OUT].includes(item.type))
        throw new Error("Tipo de ajuste inválido");

      // Guardar item
      await AdjustmentRepo.addItem(client, {
        adjustment_id: adjustment.id,
        product_id: item.product_id,
        qty,
        type: item.type,
        note: item.note,
        client_id,
      });

      // Aplicar movimiento de inventario
      await InventoryRepo.createAndApply(
        client,
        {
          branch_id,
          product_id: item.product_id,
          qty,
          type: item.type,
          unit_cost: 0,
          note: `Ajuste ${adjustment.doc_no}`,
          ref_type: "adjustments",
          ref_id: adjustment.id,
        },
        client_id,
        user_id
      );
    }

    // 3️⃣ Publicar ajuste
    const posted = await AdjustmentRepo.setPosted(client, adjustment.id, client_id);

    // 4️⃣ Registrar log general
    await InventoryRepo.logActivity(
      client,
      user_id,
      client_id,
      "CREATE_ADJUSTMENT",
      `Ajuste #${posted.id} creado con ${items.length} productos`,
      "adjustments",
      posted.id
    );

    await client.query("COMMIT");

    const itemsResp = await AdjustmentRepo.findItems(posted.id, client_id);
    return { ...posted, items: itemsResp };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 📋 Listar ajustes
 */
export async function listAdjustments(client_id, filters) {
  return await AdjustmentRepo.findAll(client_id, filters);
}

/**
 * 🔍 Obtener ajuste con sus productos
 */
export async function getAdjustmentById(id, client_id) {
  const header = await AdjustmentRepo.findById(id, client_id);
  if (!header) return null;
  const items = await AdjustmentRepo.findItems(id, client_id);
  return { ...header, items };
}
