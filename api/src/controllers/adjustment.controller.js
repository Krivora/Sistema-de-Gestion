import * as AdjustmentService from "../services/adjustment.service.js";

export async function create(req, res, next) {
  try {
    const tx = await AdjustmentService.createAdjustment(req.body, req.user);
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function list(req, res, next) {
  try {
    const filters = {
      branch_id: req.query.branch_id,
      product_id: req.query.product_id,
      type: req.query.type,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    };
    const data = await AdjustmentService.listAdjustments(req.user.client_id, filters);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
