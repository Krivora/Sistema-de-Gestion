import * as ProductService from "../services/product.service.js";

export async function getAll(req, res, next) {
  try {
    const data = await ProductService.getAllProducts(req.user.client_id, req.user.role_name);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const product = await ProductService.getProductById(
      req.params.id,
      req.user.client_id,
      req.user.role_name
    );
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const product = await ProductService.createProduct(req.body, req.user.client_id, req.user.role_name);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req, res, next) {
  try {
    const updated = await ProductService.updateProduct(
      req.params.id,
      req.body,
      req.user.client_id,
      req.user.role_name
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function desactivateProduct(req, res, next) {
  try {
    const product = await ProductService.desactivateProduct(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrada" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}
