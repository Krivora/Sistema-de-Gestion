import express from "express";
import * as SaleController from "../controllers/sale.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 🧾 Listar ventas
router.get("/", allow("read", "sales"), SaleController.list);

// 🧾 Obtener venta por ID
router.get("/:id", allow("read", "sales"), SaleController.getById);

// ➕ Crear + postear venta
router.post("/", allow("create", "sales"), SaleController.createAndPost);

export default router;
