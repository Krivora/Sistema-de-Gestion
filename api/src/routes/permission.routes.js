// src/routes/permission.routes.js
import express from "express";
import { PermissionController } from "../controllers/permission.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { attachPermissions } from "../middleware/permissions.middleware.js";
import { allow } from "../middleware/allow.js";

const router = express.Router();

router.use(authRequired);
router.use(attachPermissions);

// 📘 Listar permisos (solo lectura)
router.get("/", allow("read", "permissions"), PermissionController.list);

export default router;
