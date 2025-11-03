import express from "express";
import * as CatalogController from "../controllers/catalog.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authRequired);

// 📚 Obtener todos los catálogos del cliente
router.get("/", CatalogController.getCatalogs);

// 📦 Listar items de un catálogo específico
router.get("/:code/items", CatalogController.getItems);

// ➕ Crear item
router.post("/:code/items", CatalogController.createItem);

// ✏️ Editar item
router.put("/items/:id", CatalogController.updateItem);

// 🚫 Soft delete
router.delete("/items/:id", CatalogController.removeItem);

// ♻️ Restaurar
router.patch("/items/:id/restore", CatalogController.restoreItem);

export default router;
