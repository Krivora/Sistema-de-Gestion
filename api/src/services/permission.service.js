// src/services/permission.service.js
import * as PermissionRepo from "../repositories/permission.repository.js";

export const PermissionService = {
  async list() {
    return await PermissionRepo.getAllPermissions();
  }
};
