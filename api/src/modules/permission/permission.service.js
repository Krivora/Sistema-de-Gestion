import * as PermissionRepo from "./permission.repository.js";

export async function list() {
  return PermissionRepo.findAll();
}

export async function getById(id) {
  return PermissionRepo.findById(id);
}