import * as ReportRepo from "./report.repository.js";

export async function stock({ branchId, categoryId, clientId, roleName }) {
  return ReportRepo.getCurrentStockByBranch(branchId, categoryId, clientId, roleName);
}

export async function sales({ startDate, endDate, clientId, roleName }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });
  return ReportRepo.getSalesByPeriod({ startDate, endDate, clientId, roleName });
}

export async function purchases({ startDate, endDate, clientId, roleName }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });
  return ReportRepo.getPurchasesByPeriod({ startDate, endDate, clientId, roleName });
}

export async function topProducts({ limit, clientId, roleName }) {
  return ReportRepo.getTopSellingProducts(limit, clientId, roleName);
}

export async function dashboard({ startDate, endDate, clientId, roleName }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });
  return ReportRepo.getDashboardSummary({ startDate, endDate, clientId, roleName });
}