import express from "express";
import * as CustomerController from "../controllers/customer.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

// Middlewares globales
router.use(authRequired);
router.use(attachPermissions);

// 📘 Listar clientes
router.get("/", allow("read", "customers"), CustomerController.list);

// 📘 Obtener un cliente
router.get("/:id", allow("read", "customers"), CustomerController.getById);

// ➕ Crear cliente
router.post("/", allow("create", "customers"), CustomerController.create);

// ✏️ Editar cliente
router.put("/:id", allow("update", "customers"), CustomerController.update);

// 🚫 Desactivar cliente
router.patch("/:id/deactivate", allow("delete", "customers"), CustomerController.deactivate);

export default router;
