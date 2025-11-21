// src/services/role.service.js
import * as RoleRepo from "../repositories/role.repository.js";

export const RoleService = {
  async getRoles() {
    return await RoleRepo.getAllRoles();
  },

  async getRole(roleId) {
    const rows = await RoleRepo.getRoleWithPermissions(roleId);

    if (rows.length === 0) return null;

    const role = {
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      level: rows[0].level,
      permissions: rows
        .filter(r => r.permission_id)
        .map(r => ({ id: r.permission_id, key: r.permission_key }))
    };

    return role;
  },

  async create(data) {
    return await RoleRepo.createRole(data);
  },

  async update(roleId, data) {
    return await RoleRepo.updateRole(roleId, data);
  },

  async delete(roleId) {
    return await RoleRepo.deleteRole(roleId);
  },

  async assignPermissions(roleId, permissionIds) {
    return await RoleRepo.assignPermissions(roleId, permissionIds);
  }
};
