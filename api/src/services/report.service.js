import * as repo from "../repositories/report.repository.js";

export const ReportsService = {
  async stock(branchId) {
    return await repo.getCurrentStockByBranch(branchId);
  },
  async sales({ startDate, endDate }) {
    return await repo.getSalesByPeriod({ startDate, endDate });
  },
  async purchases({ startDate, endDate }) {
    return await repo.getPurchasesByPeriod({ startDate, endDate });
  },
  async topProducts(limit) {
    return await repo.getTopSellingProducts(limit);
  },
  async dashboard({ startDate, endDate }) {
    return await repo.getDashboardSummary({ startDate, endDate });
  },
};
