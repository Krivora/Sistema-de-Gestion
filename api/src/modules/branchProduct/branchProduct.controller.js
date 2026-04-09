import * as BranchProductService from "./branchProduct.service.js";

export async function getAll(req, res, next) {
  try {
    res.json(await BranchProductService.listAllBranchProducts(req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function getByBranch(req, res, next) {
  try {
    res.json(await BranchProductService.listByBranch(req.params.branchId, req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function getOne(req, res, next) {
  try {
    const row = await BranchProductService.getBranchProduct(req.params.id, req.user.client_id, req.user.role_name);
    if (!row) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(row);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const row = await BranchProductService.addBranchProduct(req.body, req.user.client_id, req.user.role_name);
    const enriched = await BranchProductService.getBranchProduct(row.id, req.user.client_id, req.user.role_name);
    res.status(201).json(enriched);
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const row = await BranchProductService.editBranchProduct(req.params.id, req.body);
    const enriched = await BranchProductService.getBranchProduct(row.id, req.user.client_id, req.user.role_name);
    res.json(enriched);
  } catch (err) { next(err); }
}

export async function toggleStatus(req, res, next) {
  try {
    const isActive = req.body.is_active;
    const row = await BranchProductService.toggleBranchProductStatus(req.params.id, isActive);
    const enriched = await BranchProductService.getBranchProduct(row.id, req.user.client_id, req.user.role_name);
    res.json(enriched);
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    res.json(await BranchProductService.removeBranchProduct(req.params.id));
  } catch (err) { next(err); }
}