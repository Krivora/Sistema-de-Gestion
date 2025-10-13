import { ReportsService } from "../services/report.service.js";

export const ReportsController = {
  async stock(req, res) {
    try {
      const { branchId } = req.query;
      const data = await ReportsService.stock(branchId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async sales(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.sales({ startDate, endDate });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async purchases(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.purchases({ startDate, endDate });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async topProducts(req, res) {
    try {
      const limit = req.query.limit || 10;
      const data = await ReportsService.topProducts(limit);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async dashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportsService.dashboard({ startDate, endDate });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
