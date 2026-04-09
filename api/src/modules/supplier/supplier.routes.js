import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as SupplierController from "./supplier.controller.js";

const router = Router();

router.get("/",                 allow("read",   "suppliers"), SupplierController.list);
router.get("/:id",              allow("read",   "suppliers"), SupplierController.getById);
router.post("/",                allow("create", "suppliers"), SupplierController.create);
router.put("/:id",              allow("update", "suppliers"), SupplierController.update);
router.patch("/:id/deactivate", allow("delete", "suppliers"), SupplierController.deactivate);

export default router;