import * as UserRepo from "../repositories/user.repository.js";
import bcrypt from "bcrypt";

export async function getAllUsers() {
  return await UserRepo.findAll();
}

export async function getUserById(id) {
  return await UserRepo.findById(id);
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
export async function deleteUser(id) {
  return await UserRepo.remove(id);
}

// ✅ Cambiar dark mode
export async function changeDarkMode(userId, darkMode) {
  return await UserRepo.updateDarkMode(userId, darkMode);
}
