import pool from "../../config/db.js";
import * as PackageRepo from "./package.repository.js";
import { logAction } from "../../core/utils/audit.js";

const isSuperAdmin = (role) => role === "superadmin";

const KINDS  = ["fixed", "flexible"];
const SCOPES = ["any", "category", "list"];

const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });

/**
 * Normaliza y valida el paquete completo.
 *
 * Un paquete fijo se define por su contenido; uno flexible, por cuántas piezas
 * lleva y de dónde pueden salir. Guardar los campos del otro tipo solo genera
 * datos muertos que después nadie sabe si aplican, así que aquí se limpian.
 */
function normalizePayload(data) {
  const name = String(data.name ?? "").trim();
  if (!name) throw bad("El nombre del paquete es requerido");

  const kind = KINDS.includes(data.kind) ? data.kind : "fixed";

  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) throw bad("El precio del paquete es inválido");

  const rawItems = Array.isArray(data.items) ? data.items : [];
  const items = [];
  const seen = new Set();

  for (const raw of rawItems) {
    const product_id = Number(raw.product_id);
    if (!Number.isInteger(product_id)) throw bad("Producto inválido en el contenido del paquete");
    if (seen.has(product_id)) throw bad("Hay un producto repetido en el paquete");
    seen.add(product_id);

    const qty = kind === "fixed" ? Number(raw.qty ?? 1) : 1;
    if (!Number.isFinite(qty) || qty <= 0) throw bad("La cantidad de cada producto debe ser mayor a cero");

    items.push({ product_id, qty });
  }

  if (kind === "fixed") {
    if (!items.length) throw bad("Un paquete predefinido necesita al menos un producto");
    return {
      name, kind, price, items,
      description: data.description ?? null,
      item_count: null,
      selection_scope: "any",
      category_id: null,
    };
  }

  const item_count = Number(data.item_count);
  if (!Number.isFinite(item_count) || item_count <= 0)
    throw bad("Indica cuántas piezas lleva el paquete");

  const selection_scope = SCOPES.includes(data.selection_scope) ? data.selection_scope : "any";

  const category_id = selection_scope === "category" ? Number(data.category_id) : null;
  if (selection_scope === "category" && !Number.isInteger(category_id))
    throw bad("Selecciona la categoría de la que saldrán los productos");

  if (selection_scope === "list" && !items.length)
    throw bad("Agrega los productos que este paquete acepta");

  return {
    name, kind, price, item_count, selection_scope, category_id,
    description: data.description ?? null,
    // En 'any' la lista no aplica: guardarla haría creer que sí restringe.
    items: selection_scope === "list" ? items : [],
  };
}

async function assertProductsExist(db, items, clientId) {
  if (!items.length) return;
  const ids = items.map((i) => i.product_id);
  const valid = await PackageRepo.findValidProductIds(db, ids, clientId);
  const missing = ids.filter((id) => !valid.has(id));
  if (missing.length)
    throw bad(`Hay ${missing.length} producto(s) que ya no existen o están inactivos`);
}

export async function listPackages(clientId, role) {
  return PackageRepo.findAll(isSuperAdmin(role) ? null : clientId);
}

export async function getPackage(id, clientId, role) {
  return PackageRepo.findById(id, isSuperAdmin(role) ? null : clientId);
}

export async function addPackage(data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? (data.client_id ?? clientId) : clientId;

  const payload = normalizePayload(data);

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");
    await assertProductsExist(trx, payload.items, targetClient);

    const record = await PackageRepo.create(trx, {
      ...payload, client_id: targetClient, code: data.code,
    });
    await PackageRepo.replaceItems(trx, record.id, targetClient, payload.items);

    await trx.query("COMMIT");

    const full = await PackageRepo.findById(record.id, targetClient);

    await logAction({
      ...meta, client_id: targetClient, user_id,
      action: "CREATE_PACKAGE",
      description: `Paquete "${full.name}" creado (${full.kind === "fixed" ? "predefinido" : "armable"})`,
      ref_table: "packages", ref_id: full.id,
      new_data: full,
    });

    return full;
  } catch (err) {
    await trx.query("ROLLBACK");
    if (err.code === "23505") throw bad("Ya existe un paquete con ese código", 409);
    throw err;
  } finally {
    trx.release();
  }
}

export async function editPackage(id, data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? (data.client_id ?? clientId) : clientId;

  const before = await PackageRepo.findById(id, targetClient);
  if (!before) throw bad("Paquete no encontrado", 404);

  const payload = normalizePayload(data);

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");
    await assertProductsExist(trx, payload.items, targetClient);

    const { items, ...fields } = payload;
    const updated = await PackageRepo.update(trx, id, targetClient, fields);
    if (!updated) throw bad("Paquete no encontrado", 404);

    await PackageRepo.replaceItems(trx, id, targetClient, items);
    await trx.query("COMMIT");

    const full = await PackageRepo.findById(id, targetClient);

    await logAction({
      ...meta, client_id: targetClient, user_id,
      action: "UPDATE_PACKAGE",
      description: `Paquete "${full.name}" actualizado`,
      ref_table: "packages", ref_id: id,
      old_data: before, new_data: full,
    });

    return full;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

async function changeStatus(id, status, user, { action, verb }, meta = {}) {
  const { client_id, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? null : client_id;

  const before = await PackageRepo.findById(id, targetClient);
  if (!before) throw bad("Paquete no encontrado", 404);

  const record = await PackageRepo.updateStatus(id, targetClient, status);
  if (!record) throw bad("Paquete no encontrado", 404);

  await logAction({
    ...meta, client_id, user_id,
    action,
    description: `Paquete "${record.name}" ${verb}`,
    ref_table: "packages", ref_id: id,
    old_data: before, new_data: status === "deleted" ? null : record,
  });

  return record;
}

export const activatePackage = (id, user, meta) =>
  changeStatus(id, "active", user, { action: "ACTIVATE_PACKAGE", verb: "activado" }, meta);

export const deactivatePackage = (id, user, meta) =>
  changeStatus(id, "inactive", user, { action: "DEACTIVATE_PACKAGE", verb: "desactivado" }, meta);

/**
 * Borrado lógico. Las ventas que ya lo usaron conservan su copia del nombre y
 * del precio en sale_packages, así que los tickets viejos no se alteran.
 */
export const deletePackage = (id, user, meta) =>
  changeStatus(id, "deleted", user, { action: "DELETE_PACKAGE", verb: "eliminado" }, meta);
