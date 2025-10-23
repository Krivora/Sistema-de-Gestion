import { Router } from "express";
import * as UserController from "../controllers/user.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authRequired, UserController.getAll);
router.get("/:id", authRequired, UserController.getById);
router.post("/", authRequired, UserController.create);
router.put("/:id", authRequired, UserController.update);
router.put("/:id/deactivate", UserController.deactivateUser);
router.put("/:id/activate", UserController.activateUser);
router.put("/:id/dark-mode", authRequired, UserController.updateDarkMode);
router.delete("/:id", authRequired, UserController.remove);

export default router;
