import express from "express";
import * as ProductController from "../controllers/product.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📦 Listar productos
router.get("/", allow("read", "products"), ProductController.getAll);

// 📦 Obtener producto por ID
router.get("/:id", allow("read", "products"), ProductController.getById);

// ➕ Crear producto
router.post("/", allow("create", "products"), ProductController.create);

// ✏️ Actualizar producto
router.put("/:id", allow("update", "products"), ProductController.update);

// ♻️ Activar producto
router.put("/:id/activate", allow("update", "products"), ProductController.activateProduct);

// 🚫 Desactivar producto
router.put("/:id/desactivate", allow("update", "products"), ProductController.desactivateProduct);

// ❌ Eliminar producto
router.put("/:id/delete", allow("delete", "products"), ProductController.deleteProduct);

export default router;
