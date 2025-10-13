// src/routes/purchase.routes.js
import { Router } from "express";
import * as PurchaseController from "../controllers/purchase.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authRequired, PurchaseController.getPurchases);
router.get("/:id", authRequired, PurchaseController.getPurchase);
router.post("/", authRequired, PurchaseController.createPurchase);
router.delete("/:id", authRequired, PurchaseController.deletePurchase);

export default router;
