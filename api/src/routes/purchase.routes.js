import express from "express";
import * as PurchaseController from "../controllers/purchase.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📦 Listar compras
router.get("/", allow("read", "purchases"), PurchaseController.list);

// 📦 Obtener compra por ID
router.get("/:id", allow("read", "purchases"), PurchaseController.getById);

// ➕ Crear compra + POST
router.post("/", allow("create", "purchases"), PurchaseController.createAndPost);

export default router;
