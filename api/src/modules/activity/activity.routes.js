import { Router } from "express";
import { requireRole } from "../../core/middleware/role.middleware.js";
import * as Controller from "./activity.controller.js";

const router = Router();
router.get("/",                          requireRole("superadmin"), Controller.getAll);
router.get("/stats",                     requireRole("superadmin"), Controller.getStats);
router.get("/:id",                       requireRole("superadmin"), Controller.getById);
router.get("/entity/:ref_table/:ref_id", requireRole("superadmin"), Controller.getByEntity);

export default router;