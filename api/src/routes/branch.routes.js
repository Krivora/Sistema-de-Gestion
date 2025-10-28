import express from "express";
import * as BranchController from "../controllers/branch.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authRequired);

// 🔒 Admins de cliente y superadmins pueden crear/editar
router.get("/", requireRole("superadmin", "admin"), BranchController.getAll);
router.get("/:id", requireRole("superadmin", "admin"), BranchController.getById);
router.post("/", requireRole("superadmin", "admin"), BranchController.create);
router.put("/:id", requireRole("superadmin", "admin"), BranchController.update);
router.put("/:id/desactivate", authRequired, BranchController.desactivateBranch);
export default router;
