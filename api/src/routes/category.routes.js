// src/routes/category.routes.js
import { Router } from "express";
import * as CategoryController from "../controllers/category.controller.js";
import { authRequired, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, CategoryController.getCategories);
router.get("/:id", authRequired, CategoryController.getCategory);
router.post("/", authRequired, CategoryController.createCategory);
router.put("/:id", authRequired,requireRole("superadmin", "admin"), CategoryController.updateCategory);
router.put("/:id/desactivate", authRequired,requireRole("superadmin", "admin"), CategoryController.desactivateCategory);

export default router;
