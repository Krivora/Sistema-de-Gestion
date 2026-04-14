import * as BranchRepo from "./branch.repository.js";
import pool from "../../config/db.js";
import { logAction } from "../../core/utils/audit.js";

const isSuperAdmin = (role) => role === "superadmin";

async function checkBranchLimit(clientId) {
  const { rows } = await pool.query(
    `SELECT b.max_branches, COUNT(br.id)::int AS total
     FROM clients b
     LEFT JOIN branches br ON br.client_id = b.id AND br.is_active = TRUE
     WHERE b.id = $1
     GROUP BY b.max_branches`,
    [clientId]
  );
  const limit = Number(rows[0]?.max_branches ?? 1);
  const total = Number(rows[0]?.total ?? 0);
  if (total >= limit)
    throw Object.assign(new Error(`Límite de sucursales alcanzado (${limit}). Contacte a soporte.`), { status: 400 });
}

export async function getAllBranches(clientId, role) {
  return BranchRepo.findAll(isSuperAdmin(role) ? null : clientId);
}

export async function getBranchById(id, clientId, role) {
  return BranchRepo.findById(id, isSuperAdmin(role) ? null : clientId);
}

export async function createBranch(data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  if (!data.name) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });

  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;
  if (!targetClient) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  await checkBranchLimit(targetClient);

  const branch = await BranchRepo.create({
    code: data.code ?? null,
    name: data.name,
    address: data.address ?? null,
    phone: data.phone ?? null,
    client_id: targetClient,
  });

  await logAction({
    ...meta,
    client_id: targetClient, user_id,
    action: "CREATE_BRANCH",
    description: `Sucursal "${branch.name}" creada`,
    ref_table: "branches", ref_id: branch.id,
    new_data: branch,
  });

  return branch;
}

export async function updateBranch(id, data, user, meta = {}) {
  const { client_id: clientId, role, id: user_id } = user;
  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;

  const before = await BranchRepo.findById(id, targetClient);
  const updated = await BranchRepo.update(id, targetClient, data);
  if (!updated) throw Object.assign(new Error("Sucursal no encontrada"), { status: 404 });

  await logAction({
    ...meta,
    client_id: targetClient, user_id,
    action: "UPDATE_BRANCH",
    description: `Sucursal "${updated.name}" actualizada`,
    ref_table: "branches", ref_id: updated.id,
    old_data: before,
    new_data: updated,
  });

  return updated;
}

export async function activateBranch(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const branch = await BranchRepo.activate(id);
  if (!branch) throw Object.assign(new Error("Sucursal no encontrada"), { status: 404 });

  await logAction({
    ...meta,
    client_id, user_id,
    action: "ACTIVATE_BRANCH",
    description: `Sucursal "${branch.name}" activada`,
    ref_table: "branches", ref_id: branch.id,
    new_data: branch,
  });

  return branch;
}

export async function deactivateBranch(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const branch = await BranchRepo.deactivate(id);
  if (!branch) throw Object.assign(new Error("Sucursal no encontrada"), { status: 404 });

  await logAction({
    ...meta,
    client_id, user_id,
    action: "DEACTIVATE_BRANCH",
    description: `Sucursal "${branch.name}" desactivada`,
    ref_table: "branches", ref_id: branch.id,
    old_data: branch,
  });

  return branch;
}

export async function deleteBranch(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const branch = await BranchRepo.softDelete(id);
  if (!branch) throw Object.assign(new Error("Sucursal no encontrada o ya eliminada"), { status: 404 });

  await logAction({
    ...meta,
    client_id, user_id,
    action: "DELETE_BRANCH",
    description: `Sucursal "${branch.name}" eliminada`,
    ref_table: "branches", ref_id: branch.id,
    old_data: branch,
  });

  return branch;
}