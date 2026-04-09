import * as BranchRepo from "./branch.repository.js";
import pool from "../../config/db.js";

const isSuperAdmin = (role) => role === "superadmin";

async function checkBranchLimit(clientId) {
  const { rows } = await pool.query(
    `SELECT b.max_branches,
            COUNT(br.id)::int AS total
     FROM clients b
     LEFT JOIN branches br ON br.client_id = b.id AND br.is_active = TRUE
     WHERE b.id = $1
     GROUP BY b.max_branches`,
    [clientId]
  );

  const limit = Number(rows[0]?.max_branches ?? 1);
  const total = Number(rows[0]?.total ?? 0);

  if (total >= limit) {
    throw Object.assign(
      new Error(`Límite de sucursales alcanzado (${limit}). Contacte a soporte.`),
      { status: 400 }
    );
  }
}

export async function getAllBranches(clientId, role) {
  return BranchRepo.findAll(isSuperAdmin(role) ? null : clientId);
}

export async function getBranchById(id, clientId, role) {
  return BranchRepo.findById(id, isSuperAdmin(role) ? null : clientId);
}

export async function createBranch(data, clientId, role) {
  if (!data.name) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });
  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;
  if (!targetClient) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  await checkBranchLimit(targetClient);

  return BranchRepo.create({
    code: data.code ?? null,
    name: data.name,
    address: data.address ?? null,
    phone: data.phone ?? null,
    client_id: targetClient,
  });
}

export async function updateBranch(id, clientId, role, data) {
  const targetClient = isSuperAdmin(role) ? data.client_id : clientId;
  const updated = await BranchRepo.update(id, targetClient, data);
  if (!updated) throw Object.assign(new Error("Sucursal no encontrada"), { status: 404 });
  return updated;
}

export async function deactivateBranch(id) {
  const branch = await BranchRepo.deactivate(id);
  if (!branch) throw Object.assign(new Error("Sucursal no encontrada"), { status: 404 });
  return branch;
}