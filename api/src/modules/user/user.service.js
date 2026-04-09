import * as UserRepo from "./user.repository.js";
import pool from "../../config/db.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;
const isSuperAdmin = (role) => role === "superadmin";

async function checkUserLimit(clientId) {
  // Una sola query con JOIN — igual que branch
  const { rows } = await pool.query(
    `SELECT c.max_users,
            COUNT(u.id)::int AS total
     FROM clients c
     LEFT JOIN users u ON u.client_id = c.id AND u.status = 'active'
     WHERE c.id = $1
     GROUP BY c.max_users`,
    [clientId]
  );
  const limit = Number(rows[0]?.max_users ?? 1);
  const total = Number(rows[0]?.total ?? 0);

  if (total >= limit) throw Object.assign(
    new Error(`Límite de usuarios alcanzado (${limit}). Contacte a soporte.`),
    { status: 400 }
  );
}

export async function getAllUsers(clientId, role, status = "active") {
  return isSuperAdmin(role)
    ? UserRepo.findAllGlobal(status)
    : UserRepo.findAll(clientId, status);
}

export async function getUserById(id, clientId, role) {
  return isSuperAdmin(role)
    ? UserRepo.findByIdNoClient(id)
    : UserRepo.findById(id, clientId);
}

export async function createUser(data, clientId, role) {
  const { name, email, password, role_id, branch_id, client_id } = data;
  if (!name || !email || !password || !role_id) {
    throw Object.assign(new Error("name, email, password y role_id son requeridos"), { status: 400 });
  }

  const targetClient = isSuperAdmin(role) ? client_id : clientId;
  if (!targetClient) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  await checkUserLimit(targetClient);

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return UserRepo.create({ name, email, password: hashed, role_id, branch_id, client_id: targetClient });
}

export async function updateUser(id, clientId, role, data) {
  const targetClient = isSuperAdmin(role) ? (data.client_id ?? clientId) : clientId;
  const updated = await UserRepo.update(id, targetClient, data);
  if (!updated) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return updated;
}

export async function deactivateUser(id) {
  const user = await UserRepo.deactivate(id);
  if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return user;
}

export async function deleteUser(id) {
  const user = await UserRepo.softDelete(id);
  if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return user;
}

export async function changeDarkMode(userId, darkMode) {
  const user = await UserRepo.updateDarkMode(userId, darkMode);
  if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return user;
}