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
    const newBranch = await BranchService.createBranch(
      req.body,
      req.user.client_id,
      req.user.role_name
    );
    res.status(201).json(newBranch);
  } catch (err) {
    // Si es un error de límite, devolver mensaje claro al cliente
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
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

export async function desactivateBranch(req, res, next) {
  try {
    const branch = await BranchService.desactivateBranch(req.params.id);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}
