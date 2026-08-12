import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as PackageController from "./package.controller.js";

const router = Router();

router.get("/",                 allow("read",   "packages"), PackageController.list);
router.get("/:id",              allow("read",   "packages"), PackageController.getById);
router.post("/",                allow("create", "packages"), PackageController.create);
router.put("/:id",              allow("update", "packages"), PackageController.update);
router.patch("/:id/activate",   allow("update", "packages"), PackageController.activate);
router.patch("/:id/deactivate", allow("update", "packages"), PackageController.deactivate);
router.patch("/:id/delete",     allow("delete", "packages"), PackageController.remove);

export default router;
