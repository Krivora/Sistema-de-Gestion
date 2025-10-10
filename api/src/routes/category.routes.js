import { Router } from "express";
import * as CategoryController from "../controllers/category.controller.js";

const router = Router();

router.get("/", CategoryController.getCategories);
router.get("/:id", CategoryController.getCategory);
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.put("/:id/deactivate", CategoryController.deactivateCategory);
router.put("/:id/activate", CategoryController.activateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;
