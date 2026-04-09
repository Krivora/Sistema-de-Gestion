import * as AdjustmentService from "./adjustment.service.js";

export async function createAndPost(req, res, next) {
  try {
    const result = await AdjustmentService.createAndPostAdjustment(req.body, req.user);
    res.status(201).json({ success: true, message: "Ajuste creado correctamente", data: result });
  } catch (err) { next(err); }
}

export async function list(req, res, next) {
  try {
    const { branch_id, date_from, date_to } = req.query;
    const data = await AdjustmentService.listAdjustments(req.user.client_id, { branch_id, date_from, date_to });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const data = await AdjustmentService.getAdjustmentById(req.params.id, req.user.client_id);
    if (!data) return res.status(404).json({ error: "Ajuste no encontrado" });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}