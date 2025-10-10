import * as SalesService from "../services/sale.service.js";

export async function getSales(req, res, next) {
  try {
    const data = await SalesService.listSales();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getSale(req, res, next) {
  try {
    const sale = await SalesService.getSale(req.params.id);
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(sale);
  } catch (err) {
    next(err);
  }
}

export async function createSale(req, res, next) {
  try {
    const sale = await SalesService.createSale(req.body);
    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
}

export async function deleteSale(req, res, next) {
  try {
    const sale = await SalesService.removeSale(req.params.id);
    if (!sale) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(sale);
  } catch (err) {
    next(err);
  }
}
