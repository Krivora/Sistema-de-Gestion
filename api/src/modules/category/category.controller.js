import * as CategoryService from "./category.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function getCategories(req, res, next) {
  try {
    res.json(await CategoryService.listCategories(req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function getCategory(req, res, next) {
  try {
    const cat = await CategoryService.getCategory(req.params.id, req.user.client_id, req.user.role_name);
    if (!cat) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(cat);
  } catch (err) { next(err); }
}

export async function createCategory(req, res, next) {
  try {
    const { name, description, code, client_id } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es requerido" });
    res.status(201).json(
      await CategoryService.addCategory({ name, description, code, client_id }, req.user, extractRequestMeta(req))
    );
  } catch (err) { next(err); }
}

export async function updateCategory(req, res, next) {
  try {
    const { name, description, client_id } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es requerido" });
    res.json(
      await CategoryService.editCategory(req.params.id, { name, description, client_id }, req.user, extractRequestMeta(req))
    );
  } catch (err) { next(err); }
}

export async function activateCategory(req, res, next) {
  try {
    const cat = await CategoryService.activateCategory(req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Categoría "${cat.name}" y sus productos activados`, category: cat });
  } catch (err) { next(err); }
}

export async function deactivateCategory(req, res, next) {
  try {
    const cat = await CategoryService.deactivateCategory(req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Categoría "${cat.name}" y sus productos desactivados`, category: cat });
  } catch (err) { next(err); }
}

export async function deleteCategory(req, res, next) {
  try {
    const cat = await CategoryService.deleteCategory(req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Categoría "${cat.name}" y sus productos eliminados`, category: cat });
  } catch (err) { next(err); }
}