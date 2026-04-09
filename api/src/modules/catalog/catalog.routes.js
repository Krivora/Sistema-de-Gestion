import { Router } from "express";
import { allow } from "../../core/middleware/allow.js";
import * as CatalogController from "./catalog.controller.js";

const router = Router();

router.get("/",                       allow("read",   "catalogs"), CatalogController.getCatalogs);
router.get("/:code/items",            allow("read",   "catalogs"), CatalogController.getItems);
router.post("/:code/items",           allow("create", "catalogs"), CatalogController.createItem);
router.put("/items/:id",              allow("update", "catalogs"), CatalogController.updateItem);
router.delete("/items/:id",           allow("delete", "catalogs"), CatalogController.removeItem);
router.patch("/items/:id/restore",    allow("update", "catalogs"), CatalogController.restoreItem);

export default router;