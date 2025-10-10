import { Router } from "express";
import * as SaleController from "../controllers/sale.controller.js";

const router = Router();

router.get("/", SaleController.getSales);
router.get("/:id", SaleController.getSale);
router.post("/", SaleController.createSale);
router.delete("/:id", SaleController.deleteSale);

export default router;
