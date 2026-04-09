import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import { requireRole } from "../../core/middleware/role.middleware.js";
import { uploadLogo } from "../../core/middleware/uploadLogo.middleware.js";
import * as ClientController from "./client.controller.js";

const router = Router();
// authRequired + attachPermissions vienen de routes/index.js

// Solo superadmin puede gestionar clientes
router.get("/",                  requireRole("superadmin"), allow("read",   "clients"), ClientController.getAll);
router.get("/:id",               requireRole("superadmin"), allow("read",   "clients"), ClientController.getById);
router.post("/",                 requireRole("superadmin"), allow("create", "clients"), ClientController.create);
router.put("/:id",               requireRole("superadmin"), allow("update", "clients"), ClientController.update);
router.patch("/:id/deactivate",  requireRole("superadmin"), allow("delete", "clients"), ClientController.deactivate);
router.post("/:id/logo",         requireRole("superadmin"), allow("update", "clients"), uploadLogo, ClientController.uploadLogo);

export default router;