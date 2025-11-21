import { PermissionService } from "../services/permission.service.js";

export const PermissionController = {
  // 📘 Listar permisos
  async list(req, res) {
    try {
      const permissions = await PermissionService.list();
      res.json(permissions);
    } catch (error) {
      console.error("Error listando permisos:", error);
      res.status(500).json({ error: "Error al obtener permisos" });
    }
  },

  // 📘 Obtener un permiso por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const permission = await PermissionService.getById(id);

      if (!permission) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      res.json(permission);
    } catch (error) {
      console.error("Error obteniendo permiso:", error);
      res.status(500).json({ error: "Error al obtener permiso" });
    }
  },

  // ➕ Crear permiso
  async create(req, res) {
    try {
      const created = await PermissionService.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creando permiso:", error);
      res.status(500).json({ error: "Error al crear permiso" });
    }
  },

  // ✏️ Actualizar permiso
  async update(req, res) {
    try {
      const { id } = req.params;
      const updated = await PermissionService.update(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error actualizando permiso:", error);
      res.status(500).json({ error: "Error al actualizar permiso" });
    }
  },

  // ❌ Eliminar permiso
  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await PermissionService.remove(id);

      if (!deleted) {
        return res.status(404).json({ error: "Permiso no encontrado" });
      }

      res.json({ message: "Permiso eliminado" });
    } catch (error) {
      console.error("Error eliminando permiso:", error);
      res.status(500).json({ error: "Error al eliminar permiso" });
    }
  }
};
