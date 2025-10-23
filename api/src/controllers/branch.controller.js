import * as BranchService from "../services/branch.service.js";

export async function getAll(req, res, next) {
  try {
    const data = await BranchService.getAllBranches(req.user.client_id, req.user.role_name);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const branch = await BranchService.getBranchById(req.params.id, req.user.client_id, req.user.role_name);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const branch = await BranchService.createBranch(req.body, req.user.client_id, req.user.role_name);
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req, res, next) {
  try {
    const updated = await BranchService.updateBranch(
      req.params.id,
      req.user.client_id,
      req.user.role_name,
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deactivate(req, res, next) {
  try {
    const deactivated = await BranchService.deactivateBranch(
      req.params.id,
      req.user.client_id,
      req.user.role_name
    );
    res.json(deactivated);
  } catch (err) {
    next(err);
  }
}
