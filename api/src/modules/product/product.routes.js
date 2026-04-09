import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as ProductController from "./product.controller.js";

const router = Router();
// authRequired + attachPermissions ya vienen del routes/index.js — no repetir aquí

router.get(   "/",               allow("read",   "products"), ProductController.getAll);
router.get(   "/:id",            allow("read",   "products"), ProductController.getById);
router.post(  "/",               allow("create", "products"), ProductController.create);
router.put(   "/:id",            allow("update", "products"), ProductController.update);
router.patch( "/:id/activate",   allow("update", "products"), ProductController.activateProduct);
router.patch( "/:id/deactivate", allow("update", "products"), ProductController.deactivateProduct);
router.patch( "/:id/delete",     allow("delete", "products"), ProductController.deleteProduct);

export default router;