import { Router } from "express";
import * as CategoryController from "../controllers/category.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = Router();

router.use(authRequired);
router.use(attachPermissions);

// 📘 Obtener categorías
router.get("/", allow("read", "categories"), CategoryController.getCategories);

// 📘 Obtener categoría por ID
router.get("/:id", allow("read", "categories"), CategoryController.getCategory);

// ➕ Crear categoría
router.post("/", allow("create", "categories"), CategoryController.createCategory);

// ✏️ Editar categoría
router.put("/:id", allow("update", "categories"), CategoryController.updateCategory);

// ♻️ Activar categoría
router.put("/:id/activate", allow("update", "categories"), CategoryController.activateCategory);

// 🚫 Desactivar categoría
router.put("/:id/desactivate", allow("update", "categories"), CategoryController.desactivateCategory);

// ❌ Eliminar categoría (puede ser soft o hard)
router.put("/:id/delete", allow("delete", "categories"), CategoryController.deleteCategory);

export default router;
