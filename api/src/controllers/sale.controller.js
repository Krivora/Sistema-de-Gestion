import * as SaleService from "../services/sale.service.js";

export async function list(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      branch_id: req.query.branch_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };
    const data = await SaleService.listSales(req.user.client_id, filters);
    res.json(data);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const data = await SaleService.getSaleById(req.params.id, req.user.client_id);
    if (!data) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(data);
  } catch (e) { next(e); }
}

export async function createAndPost(req, res, next) {
  try {
    const data = await SaleService.createAndPostSale(req.body, req.user);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
