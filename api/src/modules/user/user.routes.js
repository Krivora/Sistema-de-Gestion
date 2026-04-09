import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as UserController from "./user.controller.js";

const router = Router();

router.get("/",                   allow("read",   "users"), UserController.getAll);
router.get("/:id",                allow("read",   "users"), UserController.getById);
router.post("/",                  allow("create", "users"), UserController.create);
router.put("/:id",                allow("update", "users"), UserController.update);
router.patch("/:id/deactivate",   allow("delete", "users"), UserController.deactivateUser);
router.patch("/:id/delete",       allow("delete", "users"), UserController.deleteUser);
// dark-mode: no requiere permiso CASL pero sí authRequired (viene de index.js)
router.patch("/:id/dark-mode",    UserController.updateDarkMode);

export default router;