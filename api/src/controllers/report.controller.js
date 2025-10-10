import * as ReportService from "../services/report.service.js";

// Stock actual por sucursal
export async function getStockByBranch(req, res, next) {
  try {
    const { branch_id } = req.query;
    const data = await ReportService.stockByBranch(branch_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Ventas por periodo
export async function getSalesByPeriod(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate)
      return res.status(400).json({ error: "startDate y endDate son requeridos" });
    const data = await ReportService.salesByPeriod({ startDate, endDate });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Compras por proveedor
export async function getPurchasesBySupplier(req, res, next) {
  try {
    const data = await ReportService.purchasesBySupplier();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Top productos más vendidos
export async function getTopSellingProducts(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await ReportService.topSellingProducts(limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
