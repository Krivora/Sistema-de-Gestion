import { Router } from "express";
import * as ProductController from "../controllers/product.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/",authRequired, ProductController.getProducts);
router.get("/:id",authRequired, ProductController.getProduct);
router.post("/", authRequired, ProductController.createProduct);
router.put("/:id",authRequired, ProductController.updateProduct);
router.delete("/:id", authRequired, ProductController.deleteProduct);

router.put("/:id/activate", authRequired, ProductController.activateProduct);
router.put("/:id/deactivate", authRequired, ProductController.deactivateProduct);

export default router;
