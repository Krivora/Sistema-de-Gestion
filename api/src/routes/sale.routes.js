import express from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import * as SaleController from "../controllers/sale.controller.js";

const router = express.Router();
router.use(authRequired);

// Solo admin/superadmin
router.get("/", requireRole("superadmin", "admin"), SaleController.list);
router.get("/:id", requireRole("superadmin", "admin"), SaleController.getById);
router.post("/", requireRole("superadmin", "admin"), SaleController.createAndPost);

export default router;
