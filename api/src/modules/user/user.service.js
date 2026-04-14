import * as UserRepo from "./user.repository.js";
import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import { logAction } from "../../core/utils/audit.js";

const SALT_ROUNDS = 12;
const isSuperAdmin = (role) => role === "superadmin";

async function checkUserLimit(clientId) {
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

export async function createUser(data, clientId, role, user, meta = {}) {
  const { name, email, password, role_id, branch_id, client_id } = data;
  if (!name || !email || !password || !role_id) {
    throw Object.assign(new Error("name, email, password y role_id son requeridos"), { status: 400 });
  }

  const targetClient = isSuperAdmin(role) ? client_id : clientId;
  if (!targetClient) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  await checkUserLimit(targetClient);

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await UserRepo.create({ name, email, password: hashed, role_id, branch_id, client_id: targetClient });

  const { password: _pw, ...safeCreated } = created;

  await logAction({
    ...meta, client_id: targetClient, user_id: user.id,
    action: "CREATE_USER",
    description: `Usuario "${created.name}" creado`,
    ref_table: "users", ref_id: created.id,
    new_data: safeCreated,
  });

  return created;
}

export async function updateUser(id, clientId, role, data, user, meta = {}) {
  const targetClient = isSuperAdmin(role) ? (data.client_id ?? clientId) : clientId;

  const before = await (isSuperAdmin(role) ? UserRepo.findByIdNoClient(id) : UserRepo.findById(id, targetClient));
  if (!before) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const updated = await UserRepo.update(id, targetClient, data);
  if (!updated) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const { password: _a, ...safeBefore  } = before;
  const { password: _b, ...safeUpdated } = updated;

  await logAction({
    ...meta, client_id: targetClient, user_id: user.id,
    action: "UPDATE_USER",
    description: `Usuario "${updated.name}" actualizado`,
    ref_table: "users", ref_id: updated.id,
    old_data: safeBefore, new_data: safeUpdated,
  });

  return updated;
}

export async function deactivateUser(id, user, meta = {}) {
  const before = await UserRepo.findByIdNoClient(id);
  if (!before) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const deactivated = await UserRepo.deactivate(id);
  if (!deactivated) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const { password: _a, ...safeBefore     } = before;
  const { password: _b, ...safeDeactivated } = deactivated;

  await logAction({
    ...meta, client_id: deactivated.client_id, user_id: user.id,
    action: "DEACTIVATE_USER",
    description: `Usuario "${deactivated.name}" desactivado`,
    ref_table: "users", ref_id: deactivated.id,
    old_data: safeBefore, new_data: safeDeactivated,
  });

  return deactivated;
}

export async function deleteUser(id, user, meta = {}) {
  const before = await UserRepo.findByIdNoClient(id);
  if (!before) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const deleted = await UserRepo.softDelete(id);
  if (!deleted) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const { password: _pw, ...safeBefore } = before;

  await logAction({
    ...meta, client_id: deleted.client_id, user_id: user.id,
    action: "DELETE_USER",
    description: `Usuario "${deleted.name}" eliminado`,
    ref_table: "users", ref_id: deleted.id,
    old_data: safeBefore,
  });

  return deleted;
}

export async function changeDarkMode(userId, darkMode) {
  const user = await UserRepo.updateDarkMode(userId, darkMode);
  if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });
  return user;
}