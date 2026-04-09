import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as CustomerController from "./customer.controller.js";

const router = Router();

router.get("/",               allow("read",   "customers"), CustomerController.list);
router.get("/:id",            allow("read",   "customers"), CustomerController.getById);
router.post("/",              allow("create", "customers"), CustomerController.create);
router.put("/:id",            allow("update", "customers"), CustomerController.update);
router.patch("/:id/deactivate", allow("delete", "customers"), CustomerController.deactivate);

export default router;