import express from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import * as SupplierController from "../controllers/supplier.controller.js";

const router = express.Router();
router.use(authRequired);

router.get("/", requireRole("superadmin", "admin"), SupplierController.list);
router.get("/:id", requireRole("superadmin", "admin"), SupplierController.getById);
router.post("/", requireRole("superadmin", "admin"), SupplierController.create);
router.put("/:id", requireRole("superadmin", "admin"), SupplierController.update);
router.patch("/:id/deactivate", requireRole("superadmin", "admin"), SupplierController.deactivate);

export default router;
