import { Router } from "express";
import * as UserController from "../controllers/user.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = Router();

// Autenticación obligatoria
router.use(authRequired);

// Cargar permisos del usuario desde BD
router.use(attachPermissions);

// 👥 Listar usuarios
router.get("/", allow("read", "users"), UserController.getAll);

// 👤 Obtener usuario por ID
router.get("/:id", allow("read", "users"), UserController.getById);

// ➕ Crear usuario
router.post("/", allow("create", "users"), UserController.create);

// ✏️ Actualizar usuario
router.put("/:id", allow("update", "users"), UserController.update);

// 🚫 Desactivar usuario
router.put("/:id/deactivate", allow("delete", "users"), UserController.deactivateUser);

// ❌ Eliminar (hard delete)
router.put("/:id/delete", allow("delete", "users"), UserController.deleteUser);

// 🌙 Cambiar modo oscuro (no requiere permisos, cualquier usuario puede)
router.put("/:id/dark-mode", authRequired, UserController.updateDarkMode);

export default router;
