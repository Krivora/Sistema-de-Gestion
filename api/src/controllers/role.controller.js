// src/controllers/role.controller.js
import { RoleService } from "../services/role.service.js";

export const RoleController = {
  async getAll(req, res) {
    const roles = await RoleService.getRoles();
    res.json(roles);
  },

  async getById(req, res) {
    const role = await RoleService.getRole(req.params.id);
    if (!role) return res.status(404).json({ error: "Rol no encontrado" });
    res.json(role);
  },

  async create(req, res) {
    const { name, description, level } = req.body;

    const role = await RoleService.create({
      name,
      description,
      level: level || 1
    });

    res.json(role);
  },

  async update(req, res) {
    const role = await RoleService.update(req.params.id, req.body);
    res.json(role);
  },

  async remove(req, res) {
    await RoleService.delete(req.params.id);
    res.json({ message: "Rol eliminado" });
  },

  async assignPermissions(req, res) {
    const { permissions } = req.body;

    await RoleService.assignPermissions(req.params.id, permissions);

    res.json({ message: "Permisos actualizados" });
  }
};
