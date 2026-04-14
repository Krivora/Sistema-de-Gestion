import * as ProductService from "./product.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function getAll(req, res, next) {
  try {
    res.json(await ProductService.getAllProducts(req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const product = await ProductService.getProductById(req.params.id, req.user.client_id, req.user.role_name);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await ProductService.createProduct(req.body, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    res.json(await ProductService.updateProduct(req.params.id, req.body, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function activateProduct(req, res, next) {
  try {
    const product = await ProductService.activateProduct(req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Producto "${product.name}" activado`, product });
  } catch (err) { next(err); }
}

export async function deactivateProduct(req, res, next) {
  try {
    const product = await ProductService.deactivateProduct(req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Producto "${product.name}" desactivado`, product });
  } catch (err) { next(err); }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await ProductService.deleteProduct(req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Producto "${product.name}" eliminado`, product });
  } catch (err) { next(err); }
}