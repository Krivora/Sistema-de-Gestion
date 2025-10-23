import express from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import * as PurchaseController from "../controllers/purchase.controller.js";

const router = express.Router();
router.use(authRequired);

// Solo admin/superadmin
router.get("/", requireRole("superadmin", "admin"), PurchaseController.list);
router.get("/:id", requireRole("superadmin", "admin"), PurchaseController.getById);
router.post("/", requireRole("superadmin", "admin"), PurchaseController.createAndPost);

export default router;
