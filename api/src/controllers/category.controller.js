import * as CategoryService from "../services/category.service.js";

export async function getCategories(req, res, next) {
  try {
    const categories = await CategoryService.listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req, res, next) {
  try {
    const category = await CategoryService.getCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const category = await CategoryService.addCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const category = await CategoryService.editCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (err) {
    next(err);
  }
}


export async function deactivateCategory(req, res, next) {
  try {
    const category = await CategoryService.deactivateCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function activateCategory(req, res, next) {
  try {
    const category = await CategoryService.activateCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (err) {
    next(err);
  }
}


export async function deleteCategory(req, res, next) {
  try {
    const category = await CategoryService.removeCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (err) {
    next(err);
  }
}
