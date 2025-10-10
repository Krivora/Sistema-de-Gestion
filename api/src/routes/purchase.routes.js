import { Router } from "express";
import * as PurchaseController from "../controllers/purchase.controller.js";

const router = Router();

// 🧾 Listar todas
router.get("/", PurchaseController.getPurchases);

// 📄 Obtener una
router.get("/:id", PurchaseController.getPurchase);

// ➕ Crear nueva compra (con ítems)
router.post("/", PurchaseController.createPurchase);

// 🗑️ Eliminar compra
router.delete("/:id", PurchaseController.deletePurchase);

export default router;
