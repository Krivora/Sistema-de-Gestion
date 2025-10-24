import pool from "../config/db.js";
import * as InventoryRepo from "../repositories/inventory.repository.js";
import { INVENTORY_TYPES } from "../constants/inventoryTypes.js";

/**
 * 🧩 Crear un ajuste manual (entrada o salida)
 * data = { branch_id, product_id, qty, type, note }
 */
export async function createAdjustment(data, user) {
  const { client_id, id: user_id } = user;
  const { branch_id, product_id, qty, type, note } = data;

  if (!Object.values(INVENTORY_TYPES).includes(type))
    throw new Error("Tipo de ajuste inválido");

  if (![INVENTORY_TYPES.ADJUSTMENT_IN, INVENTORY_TYPES.ADJUSTMENT_OUT].includes(type))
    throw new Error("Solo se permiten ajustes IN/OUT manuales");

  if (!qty || qty <= 0) throw new Error("Cantidad inválida");
  if (!branch_id || !product_id) throw new Error("Sucursal y producto son requeridos");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Usar la lógica unificada del repositorio
    const tx = await InventoryRepo.createAndApply(
      {
        branch_id,
        product_id,
        qty,
        type,
        unit_cost: 0,
        note: note || (type === INVENTORY_TYPES.ADJUSTMENT_IN ? "Ajuste positivo" : "Ajuste negativo"),
        ref_type: "adjustments",
        ref_id: null, // no hay tabla externa asociada
      },
      client_id,
      user_id,
    );

    // Log general
    await InventoryRepo.logActivity(
      client,
      user_id,
      client_id,
      "CREATE_ADJUSTMENT",
      `Ajuste ${type === INVENTORY_TYPES.ADJUSTMENT_IN ? "positivo" : "negativo"} de ${qty} unidades para producto ${product_id}`,
      "inventory_transactions",
      tx.id
    );

    await client.query("COMMIT");
    return tx;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 📋 Listar ajustes de inventario
 */
export async function listAdjustments(clientId, filters = {}) {
  const { type } = filters;
  const validTypes = [INVENTORY_TYPES.ADJUSTMENT_IN, INVENTORY_TYPES.ADJUSTMENT_OUT];

  // Forzar filtro solo a ajustes
  return await InventoryRepo.findAll(clientId, {
    ...filters,
    type: validTypes.includes(type) ? type : undefined,
  });
}
