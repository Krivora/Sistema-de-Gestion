import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as CategoryController from "./category.controller.js";

const router = Router();

router.get("/",                  allow("read",   "categories"), CategoryController.getCategories);
router.get("/:id",               allow("read",   "categories"), CategoryController.getCategory);
router.post("/",                 allow("create", "categories"), CategoryController.createCategory);
router.put("/:id",               allow("update", "categories"), CategoryController.updateCategory);
router.patch("/:id/activate",    allow("update", "categories"), CategoryController.activateCategory);
router.patch("/:id/deactivate",  allow("update", "categories"), CategoryController.deactivateCategory);
router.patch("/:id/delete",      allow("delete", "categories"), CategoryController.deleteCategory);

export default router;