// src/routes/category.routes.js
import { Router } from "express";
import * as CategoryController from "../controllers/category.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, CategoryController.getCategories);
router.get("/:id", authRequired, CategoryController.getCategory);
router.post("/", authRequired, CategoryController.createCategory);
router.put("/:id", authRequired, CategoryController.updateCategory);
router.put("/:id/deactivate", authRequired, CategoryController.deactivateCategory);
router.put("/:id/activate", authRequired, CategoryController.activateCategory);
router.delete("/:id", authRequired, CategoryController.deleteCategory);

export default router;
