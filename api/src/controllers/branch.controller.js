import * as BranchService from "../services/branch.service.js";

// 📋 Listar todas
export async function getBranches(req, res, next) {
  try {
    const branches = await BranchService.listBranches();
    res.json(branches);
  } catch (err) {
    next(err);
  }
}

// 🔍 Obtener una
export async function getBranch(req, res, next) {
  try {
    const branch = await BranchService.getBranch(req.params.id);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

// 🆕 Crear
export async function createBranch(req, res, next) {
  try {
    const branch = await BranchService.addBranch(req.body);
    res.status(201).json(branch);
  } catch (err) {
    next(err);
  }
}

// ✏️ Actualizar
export async function updateBranch(req, res, next) {
  try {
    const branch = await BranchService.editBranch(req.params.id, req.body);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

// 🔄 Activar / Desactivar
export async function toggleBranchStatus(req, res, next) {
  try {
    const branch = await BranchService.toggleBranchStatus(req.params.id, req.body.is_active);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}

// 🗑️ Eliminar
export async function deleteBranch(req, res, next) {
  try {
    const branch = await BranchService.removeBranch(req.params.id);
    if (!branch) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(branch);
  } catch (err) {
    next(err);
  }
}
