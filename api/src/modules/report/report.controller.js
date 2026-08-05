import * as ReportService from "./report.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

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

export async function superadmin(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    res.json(await ReportService.superadminOverview({ startDate, endDate }));
  } catch (err) { next(err); }
}

export async function clientPayments(req, res, next) {
  try {
    res.json(await ReportService.listClientPayments(+req.params.id));
  } catch (err) { next(err); }
}

export async function registerPayment(req, res, next) {
  try {
    const { due_date, amount, note } = req.body;
    res.status(201).json(
      await ReportService.registerClientPayment(
        { clientId: +req.params.id, due_date, amount, note },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function grantGrace(req, res, next) {
  try {
    const { grace_until } = req.body;
    res.json(
      await ReportService.grantGrace(
        { clientId: +req.params.id, grace_until },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function revokeGrace(req, res, next) {
  try {
    res.json(await ReportService.revokeGrace(+req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function deletePayment(req, res, next) {
  try {
    res.json(
      await ReportService.removeClientPayment(
        +req.params.paymentId, +req.params.id, req.user, extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function dashboard(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    res.json(await ReportService.dashboard({ startDate, endDate, clientId: req.user.client_id, roleName: req.user.role_name }));
  } catch (err) { next(err); }
}