import { Router } from "express";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { allow } from "../../core/middleware/allow.js";
import * as PermissionController from "./permission.controller.js";

const router = Router();
// Solo superadmin gestiona permisos
router.get("/",    requireRole("superadmin"), allow("read", "permissions"), PermissionController.list);
router.get("/:id", requireRole("superadmin"), allow("read", "permissions"), PermissionController.getById);

export default router;