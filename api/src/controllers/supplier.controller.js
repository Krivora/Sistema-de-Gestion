import * as SupplierService from "../services/supplier.service.js";

export async function list(req, res, next) {
  try {
    const data = await SupplierService.getAll(req.user.client_id);
    res.json(data);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const data = await SupplierService.getById(req.params.id, req.user.client_id);
    if (!data) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(data);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const data = await SupplierService.create(req.body, req.user);
    res.status(201).json(data);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

export async function update(req, res, next) {
  try {
    const data = await SupplierService.update(req.params.id, req.body, req.user);
    res.json(data);
  } catch (e) { next(e); }
}

export async function deactivate(req, res, next) {
  try {
    const data = await SupplierService.deactivate(req.params.id, req.user);
    res.json(data);
  } catch (e) { next(e); }
}
