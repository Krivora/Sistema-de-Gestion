import * as ReportService from "./report.service.js";

export async function stock(req, res, next) {
  try {
    const { branchId, categoryId } = req.query;
    res.json(await ReportService.stock({ branchId, categoryId, clientId: req.user.client_id, roleName: req.user.role_name }));
  } catch (err) { next(err); }
}

export async function sales(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    res.json(await ReportService.sales({ startDate, endDate, clientId: req.user.client_id, roleName: req.user.role_name }));
  } catch (err) { next(err); }
}

export async function purchases(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    res.json(await ReportService.purchases({ startDate, endDate, clientId: req.user.client_id, roleName: req.user.role_name }));
  } catch (err) { next(err); }
}

export async function topProducts(req, res, next) {
  try {
    const { limit } = req.query;
    res.json(await ReportService.topProducts({ limit, clientId: req.user.client_id, roleName: req.user.role_name }));
  } catch (err) { next(err); }
}

export async function dashboard(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    res.json(await ReportService.dashboard({ startDate, endDate, clientId: req.user.client_id, roleName: req.user.role_name }));
  } catch (err) { next(err); }
}