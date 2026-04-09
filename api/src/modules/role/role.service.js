import * as RoleRepo from "./role.repository.js";

export async function getRoles() {
  return RoleRepo.findAll();
}

export async function getRole(roleId) {
  const rows = await RoleRepo.findWithPermissions(roleId);
  if (!rows.length) return null;

  return {
    id: rows[0].id,
    name: rows[0].name,
    description: rows[0].description,
    level: rows[0].level,
    permissions: rows
      .filter((r) => r.permission_id)
      .map((r) => ({ id: r.permission_id, key: r.permission_key })),
  };
}

export async function createRole({ name, description, level }) {
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });
  return RoleRepo.create({ name: name.trim(), description, level });
}

export async function updateRole(roleId, { name, description, level }) {
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });
  const updated = await RoleRepo.update(roleId, { name: name.trim(), description, level });
  if (!updated) throw Object.assign(new Error("Rol no encontrado"), { status: 404 });
  return updated;
}

export async function deleteRole(roleId) {
  return RoleRepo.remove(roleId);
}

export async function assignPermissions(roleId, permissionIds) {
  if (!Array.isArray(permissionIds)) {
    throw Object.assign(new Error("permissions debe ser un array de IDs"), { status: 400 });
  }
  const ids = permissionIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
  return RoleRepo.assignPermissions(roleId, ids);
}