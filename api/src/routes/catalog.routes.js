import express from "express";
import * as CatalogController from "../controllers/catalog.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📚 Obtener todos los catálogos
router.get("/", allow("read", "catalogs"), CatalogController.getCatalogs);

// 📦 Listar items de un catálogo
router.get("/:code/items", allow("read", "catalogs"), CatalogController.getItems);

// ➕ Crear item
router.post("/:code/items", allow("create", "catalogs"), CatalogController.createItem);

// ✏️ Editar item
router.put("/items/:id", allow("update", "catalogs"), CatalogController.updateItem);

// 🚫 Soft delete
router.delete("/items/:id", allow("delete", "catalogs"), CatalogController.removeItem);

// ♻️ Restaurar item
router.patch("/items/:id/restore", allow("update", "catalogs"), CatalogController.restoreItem);

export default router;
