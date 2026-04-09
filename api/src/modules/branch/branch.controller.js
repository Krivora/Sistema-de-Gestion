import * as BranchService from "./branch.service.js";

export async function getAll(req, res, next) {
  try {
    res.json(await BranchService.getAllBranches(req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const branch = await BranchService.getBranchById(req.params.id, req.user.client_id, req.user.role_name);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await BranchService.createBranch(req.body, req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    res.json(await BranchService.updateBranch(req.params.id, req.user.client_id, req.user.role_name, req.body));
  } catch (err) { next(err); }
}

export async function deactivateBranch(req, res, next) {
  try {
    res.json(await BranchService.deactivateBranch(req.params.id));
  } catch (err) { next(err); }
}