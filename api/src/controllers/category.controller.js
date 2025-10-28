import * as CategoryService from "../services/category.service.js";

// 📋 Listar todas las categorías
export async function getCategories(req, res, next) {
  try {
    const categories = await CategoryService.listCategories(
      req.user.client_id,   // 👈 cliente actual
      req.user.role_name    // 👈 rol del usuario
    );
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

// 🔍 Obtener una categoría por ID
export async function getCategory(req, res, next) {
  try {
    const category = await CategoryService.getCategory(
      req.params.id,
      req.user.client_id,   // 👈 cliente actual
      req.user.role_name    // 👈 rol del usuario
    );

    if (!category)
      return res.status(404).json({ error: "Categoría no encontrada" });

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
    // 👇 Manejo explícito de errores conocidos (como duplicate o validación)
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }

    // 👇 En cualquier otro caso, lo mandamos al manejador global
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


export async function desactivateCategory(req, res, next) {
  try {
    const category = await CategoryService.desactivateCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(category);
  } catch (err) {
    next(err);
  }
}
