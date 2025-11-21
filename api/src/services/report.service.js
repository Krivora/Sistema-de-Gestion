import * as repo from "../repositories/report.repository.js";

export const ReportsService = {
  async stock({ branchId, categoryId, clientId, roleName }) {
    return await repo.getCurrentStockByBranch(branchId, categoryId, clientId, roleName);
  },

  async sales({ startDate, endDate, clientId, roleName }) {
    return await repo.getSalesByPeriod({ startDate, endDate, clientId, roleName });
  },

  async purchases({ startDate, endDate, clientId, roleName }) {
    return await repo.getPurchasesByPeriod({ startDate, endDate, clientId, roleName });
  },

  async topProducts({ limit, clientId, roleName }) {
    return await repo.getTopSellingProducts(limit, clientId, roleName);
  },

  async dashboard({ startDate, endDate, clientId, roleName }) {
    return await repo.getDashboardSummary({ startDate, endDate, clientId, roleName });
  },
};
