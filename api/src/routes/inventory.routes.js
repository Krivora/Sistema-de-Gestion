import express from "express";
import * as InventoryController from "../controllers/inventory.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authRequired);

// Superadmin y admin pueden crear movimientos
router.get("/", requireRole("superadmin", "admin"), InventoryController.getAll);
export default router;
