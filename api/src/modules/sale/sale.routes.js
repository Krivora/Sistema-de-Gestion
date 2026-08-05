import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as SaleController from "./sale.controller.js";

const router = Router();

router.get("/",              allow("read",   "sales"), SaleController.list);
router.get("/receivables",   allow("read",   "sales"), SaleController.receivables);
router.get("/:id",           allow("read",   "sales"), SaleController.getById);
router.post("/",             allow("create", "sales"), SaleController.create);
router.put("/:id",           allow("update", "sales"), SaleController.update);
router.patch("/:id/cancel",                allow("delete", "sales"), SaleController.cancel);
router.get("/:id/returns",                 allow("read",   "sales"), SaleController.returnableItems);
router.post("/:id/returns",                allow("update", "sales"), SaleController.createReturn);
router.get("/:id/payments",                allow("read",   "sales"), SaleController.listPayments);
router.post("/:id/payments",               allow("update", "sales"), SaleController.addPayment);
router.delete("/:id/payments/:paymentId",  allow("update", "sales"), SaleController.removePayment);
router.patch("/:id/post",    allow("update", "sales"), SaleController.post);
router.patch("/:id/reopen",  allow("update", "sales"), SaleController.reopen);

export default router;