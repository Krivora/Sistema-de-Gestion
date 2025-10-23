import * as InventoryService from "../services/inventory.service.js";

export async function getAll(req, res, next) {
  try {
    const filters = {
      branch_id: req.query.branch_id,
      product_id: req.query.product_id,
      type: req.query.type,
    };
    const data = await InventoryService.getTransactions(req.user.client_id, filters);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const tx = await InventoryService.createTransaction(req.body, req.user.client_id);
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
