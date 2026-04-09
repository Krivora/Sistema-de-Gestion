import { Router } from "express";
import { requireRole } from "../../core/middleware/auth.middleware.js";
import { allow } from "../../core/middleware/allow.js";
import * as ActivityController from "./activity.controller.js";

const router = Router();
// authRequired + attachPermissions vienen de routes/index.js

router.get("/", requireRole("superadmin", "admin"), allow("read", "activities"), ActivityController.list);

export default router;