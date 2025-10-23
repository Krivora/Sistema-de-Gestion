import express from "express";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";
import * as ActivityController from "../controllers/activity.controller.js";

const router = express.Router();
router.use(authRequired);

// Solo superadmin o admin pueden ver logs
router.get("/", requireRole("superadmin", "admin"), ActivityController.list);

export default router;
