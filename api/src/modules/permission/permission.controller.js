import * as PermissionService from "./permission.service.js";

export async function list(req, res, next) {
  try {
    res.json(await PermissionService.list());
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const permission = await PermissionService.getById(req.params.id);
    if (!permission) return res.status(404).json({ error: "Permiso no encontrado" });
    res.json(permission);
  } catch (err) { next(err); }
}