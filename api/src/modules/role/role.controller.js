import * as RoleService from "./role.service.js";

export async function getAll(req, res, next) {
  try {
    res.json(await RoleService.getRoles());
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const role = await RoleService.getRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Rol no encontrado" });
    res.json(role);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { name, description, level } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es requerido" });
    res.status(201).json(await RoleService.createRole({ name, description, level }));
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { name, description, level } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es requerido" });
    res.json(await RoleService.updateRole(req.params.id, { name, description, level }));
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    await RoleService.deleteRole(req.params.id);
    res.json({ message: "Rol eliminado" });
  } catch (err) { next(err); }
}

export async function assignPermissions(req, res, next) {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: "permissions debe ser un array" });
    }
    await RoleService.assignPermissions(req.params.id, permissions);
    res.json({ message: "Permisos actualizados" });
  } catch (err) { next(err); }
}