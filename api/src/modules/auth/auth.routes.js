// src/routes/auth.routes.js
import { Router } from "express";
import * as AuthController from "./auth.controller.js";
import { authRequired } from "../../core/middleware/auth.middleware.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authRequired, AuthController.me);

export default router;
