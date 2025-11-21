import express from "express";
import * as InventoryController from "../controllers/inventory.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📦 Listar movimientos de inventario
router.get("/", allow("read", "inventory"), InventoryController.getAll);

export default router;
