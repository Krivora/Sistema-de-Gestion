import * as BranchRepo from "../repositories/branch.repository.js";
import pool from "../config/db.js";

/**
 * Validar límite de sucursales antes de crear
 */
async function checkClientBranchLimit(client_id) {
  // Obtener límite configurado en el cliente
  const { rows: clientRows } = await pool.query(
    "SELECT max_branches FROM clients WHERE id = $1",
    [client_id]
  );

  // Si no tiene registro de límite, permitir solo 1
  const limit = Number(clientRows[0]?.max_branches ?? 1);

  // Contar sucursales activas o totales
  const { rows: countRows } = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM branches
    WHERE client_id = $1
      AND is_active = TRUE
    `,
    [client_id]
  );
  const total = Number(countRows[0].total);

  // Validar límite
  if (total >= limit) {
    const message =
      `❌ No se puede crear más sucursales. ` +
      `El cliente ha alcanzado su límite máximo de ${limit} sucursales.\n` +
      `Si crees que se trata de un error, por favor comunícate con soporte.`;
    const error = new Error(message);
    error.status = 400; // 🔸 HTTP 400 Bad Request
    throw error;
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

export async function desactivateBranch(id) {
  return await BranchRepo.desactivate(id);
}
