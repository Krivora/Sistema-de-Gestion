import * as UserRepo from "../repositories/user.repository.js";
import bcrypt from "bcrypt";

export async function getAllUsers(clientId) {
  return await UserRepo.findAll(clientId);
}

export async function getUserById(id, clientId) {
  if (!id) throw new Error("ID de usuario requerido");

  if (clientId) {
    return await UserRepo.findById(id, clientId);
  } else {
    // 👇 si es superadmin (sin client_id)
    return await UserRepo.findByIdNoClient(id);
  }
}

export async function createUser(data) {
  const hashed = await bcrypt.hash(data.password, 10);
  return await UserRepo.create({ ...data, password: hashed });
}

export async function updateUser(id, data) {
  return await UserRepo.update(id, data);
}

export async function deactivateUser(id) {
  return await UserRepo.deactivate(id);
}
export async function activateUser(id) {
  return await UserRepo.activate(id);
}
// ✅ Cambiar dark mode
export async function changeDarkMode(userId, darkMode) {
  return await UserRepo.updateDarkMode(userId, darkMode);
}