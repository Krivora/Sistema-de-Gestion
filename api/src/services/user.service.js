import * as UserRepo from "../repositories/user.repository.js";
import pool from "../config/db.js";
import bcrypt from "bcrypt";

/**
 * 🧩 Validar límite de usuarios antes de crear
 */
async function checkClientUsersLimit(client_id) {
  // Obtener límite configurado en el cliente
  const { rows: clientRows } = await pool.query(
    "SELECT max_users FROM clients WHERE id = $1",
    [client_id]
  );

  // Si no tiene límite definido, permitir 1 por default
  const limit = Number(clientRows[0]?.max_users ?? 1);

  // Contar usuarios activos actuales
  const { rows: countRows } = await pool.query(
    `
    SELECT COUNT(*)::int AS total
    FROM users
    WHERE client_id = $1
      AND status = 'active'
    `,
    [client_id]
  );
  const total = Number(countRows[0].total);

  // Validar límite
  if (total >= limit) {
    const message =
      `❌ No se puede crear más usuarios. ` +
      `El cliente ha alcanzado su límite máximo de ${limit} usuarios.\n` +
      `Si crees que se trata de un error, por favor comunícate con soporte.`;
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
}

/**
 * 🧩 Obtener todos los usuarios
 */
export async function getAllUsers(clientId, userRole, status = "active") {
  if (userRole === "superadmin") {
    return await UserRepo.findAllGlobal(status);
  }
  return await UserRepo.findAll(clientId, status);
}
/**
 * 🧩 Buscar usuario por ID
 */
export async function getUserById(id, clientId, userRole) {
  if (!id) throw new Error("ID de usuario requerido");

  if (userRole === "superadmin") {
    return await UserRepo.findByIdNoClient(id);
  }

  return await UserRepo.findById(id, clientId);
}

/**
 * 🧩 Crear usuario con límite validado
 */
export async function createUser(data, clientId, userRole) {
  const targetClient = userRole === "superadmin" ? data.client_id : clientId;

  await checkClientUsersLimit(targetClient);

  const hashed = await bcrypt.hash(data.password, 10);

  return await UserRepo.create({
    name: data.name,
    email: data.email,
    password: hashed,
    role_id: data.role_id,
    branch_id: data.branch_id,
    client_id: targetClient,
  });
}

/**
 * 🧩 Actualizar usuario
 */
export async function updateUser(id, clientId, userRole, data) {
  const targetClient = userRole === "superadmin" ? data.client_id : clientId;
  return await UserRepo.update(id, targetClient, data);
}

/**
 * 🧩 Activar / desactivar usuario
 */
export async function deactivateUser(id) {
  return await UserRepo.deactivate(id);
}

export async function deleteUser(id) {
  return await UserRepo.deleted(id);
}

/**
 * 🧩 Cambiar modo oscuro
 */
export async function changeDarkMode(userId, darkMode) {
  return await UserRepo.updateDarkMode(userId, darkMode);
}
