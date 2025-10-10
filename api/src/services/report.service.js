import * as ReportRepo from "../repositories/report.repository.js";

export async function stockByBranch(branchId) {
  return await ReportRepo.getCurrentStockByBranch(branchId);
}

export async function salesByPeriod({ startDate, endDate }) {
  return await ReportRepo.getSalesByPeriod({ startDate, endDate });
}

export async function purchasesBySupplier() {
  return await ReportRepo.getPurchasesBySupplier();
}

export async function topSellingProducts(limit) {
  return await ReportRepo.getTopSellingProducts(limit);
}
