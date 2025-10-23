import * as BranchRepo from "../repositories/branch.repository.js";
import pool from "../config/db.js";

/**
 * Validar límite de sucursales antes de crear
 */
async function checkClientBranchLimit(client_id) {
  const { rows: clientRows } = await pool.query(
    "SELECT max_branches FROM clients WHERE id = $1",
    [client_id]
  );
  const limit = clientRows[0]?.max_branches ?? 1;

  const { rows: countRows } = await pool.query(
    "SELECT COUNT(*) AS total FROM branches WHERE client_id = $1",
    [client_id]
  );
  const total = Number(countRows[0].total);

  if (total >= limit) {
    throw new Error(`El cliente ha alcanzado su límite máximo de sucursales (${limit})`);
  }
}

export async function getAllBranches(clientId, userRole) {
  if (userRole === "superadmin") return await BranchRepo.findAll();
  return await BranchRepo.findAll(clientId);
}

export async function getBranchById(id, clientId, userRole) {
  if (userRole === "superadmin") return await BranchRepo.findById(id);
  return await BranchRepo.findById(id, clientId);
}

export async function createBranch(data, clientId, userRole) {
  const targetClient = userRole === "superadmin" ? data.client_id : clientId;
  await checkClientBranchLimit(targetClient);

  return await BranchRepo.create({
    code: data.code,
    name: data.name,
    address: data.address,
    phone: data.phone,
    client_id: targetClient,
  });
}

export async function updateBranch(id, clientId, userRole, data) {
  const targetClient = userRole === "superadmin" ? data.client_id : clientId;
  return await BranchRepo.update(id, targetClient, data);
}

export async function deactivateBranch(id, clientId, userRole) {
  const targetClient = userRole === "superadmin" ? null : clientId;
  return await BranchRepo.deactivate(id, targetClient);
}
