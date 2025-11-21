import express from "express";
import * as SupplierController from "../controllers/supplier.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📦 Listar proveedores
router.get("/", allow("read", "suppliers"), SupplierController.list);

// 📦 Obtener proveedor por ID
router.get("/:id", allow("read", "suppliers"), SupplierController.getById);

// ➕ Crear proveedor
router.post("/", allow("create", "suppliers"), SupplierController.create);

// ✏️ Actualizar proveedor
router.put("/:id", allow("update", "suppliers"), SupplierController.update);

// 🚫 Desactivar proveedor
router.patch("/:id/deactivate", allow("delete", "suppliers"), SupplierController.deactivate);

export default router;
