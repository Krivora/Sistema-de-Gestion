import * as InventoryService from "./inventory.service.js";

export async function getAll(req, res, next) {
  try {
    const { branch_id, product_id, type, date_from, date_to } = req.query;
    res.json(await InventoryService.getTransactions(req.user.client_id, {
      branch_id, product_id, type, date_from, date_to,
    }));
  } catch (err) { next(err); }
}