import * as UserService from "./user.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function getAll(req, res, next) {
  try {
    const { status = "active" } = req.query;
    res.json(await UserService.getAllUsers(req.user.client_id, req.user.role_name, status));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const user = await UserService.getUserById(req.params.id, req.user.client_id, req.user.role_name);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { name, email, password, role_id, branch_id, client_id } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ error: "name, email, password y role_id son requeridos" });
    }
    res.status(201).json(await UserService.createUser(
      { name, email, password, role_id, branch_id, client_id },
      req.user.client_id,
      req.user.role_name,
      req.user,
      extractRequestMeta(req)
    ));
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { name, email, role_id, branch_id } = req.body;
    res.json(await UserService.updateUser(
      req.params.id,
      req.user.client_id,
      req.user.role_name,
      { name, email, role_id, branch_id },
      req.user,
      extractRequestMeta(req)
    ));
  } catch (err) { next(err); }
}

export async function deactivateUser(req, res, next) {
  try {
    res.json(await UserService.deactivateUser(req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    res.json(await UserService.deleteUser(req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function updateDarkMode(req, res, next) {
  try {
    const { darkMode } = req.body;
    if (typeof darkMode !== "boolean") {
      return res.status(400).json({ error: "darkMode debe ser booleano" });
    }
    if (String(req.params.id) !== String(req.user.id)) {
      return res.status(403).json({ error: "No puedes modificar la preferencia de otro usuario" });
    }
    res.json(await UserService.changeDarkMode(req.params.id, darkMode));
  } catch (err) { next(err); }
}