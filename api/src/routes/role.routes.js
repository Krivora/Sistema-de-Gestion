import express from "express";
import { RoleController } from "../controllers/role.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📘 Listado de roles
router.get("/", allow("read", "roles"), RoleController.getAll);

// 📘 Obtener rol + permisos
router.get("/:id", allow("read", "roles"), RoleController.getById);

// ➕ Crear rol
router.post("/", allow("create", "roles"), RoleController.create);

// ✏️ Actualizar rol
router.put("/:id", allow("update", "roles"), RoleController.update);

// ❌ Eliminar rol
router.delete("/:id", allow("delete", "roles"), RoleController.remove);

// 🛂 Asignar permisos a un rol
router.post("/:id/permissions", allow("assignPermissions", "roles"), RoleController.assignPermissions);

export default router;
