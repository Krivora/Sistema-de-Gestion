import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as BranchController from "./branch.controller.js";

const router = Router();

router.get("/",                  allow("read",   "branches"), BranchController.getAll);
router.get("/:id",               allow("read",   "branches"), BranchController.getById);
router.post("/",                 allow("create", "branches"), BranchController.create);
router.put("/:id",               allow("update", "branches"), BranchController.update);
router.patch("/:id/activate",    allow("update", "branches"), BranchController.activateBranch);   // nuevo
router.patch("/:id/deactivate",  allow("update", "branches"), BranchController.deactivateBranch);
router.delete("/:id",            allow("delete", "branches"), BranchController.deleteBranch);     // nuevo

export default router;