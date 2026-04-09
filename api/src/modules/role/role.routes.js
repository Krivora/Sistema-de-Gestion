import { Router } from "express";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { allow } from "../../core/middleware/allow.js";
import * as RoleController from "./role.controller.js";

const router = Router();
// Solo superadmin gestiona roles
const superOnly = requireRole("superadmin");

router.get("/",                  superOnly, allow("read",              "roles"), RoleController.getAll);
router.get("/:id",               superOnly, allow("read",              "roles"), RoleController.getById);
router.post("/",                 superOnly, allow("create",            "roles"), RoleController.create);
router.put("/:id",               superOnly, allow("update",            "roles"), RoleController.update);
router.delete("/:id",            superOnly, allow("delete",            "roles"), RoleController.remove);
router.post("/:id/permissions",  superOnly, allow("assignPermissions", "roles"), RoleController.assignPermissions);

export default router;