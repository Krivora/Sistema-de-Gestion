import * as ActivityService from "../services/activity.service.js";

export async function list(req, res, next) {
  try {
    const filters = {
      user_id: req.query.user_id,
      action: req.query.action,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    };
    const data = await ActivityService.listLogs(req.user.client_id, filters);
    res.json(data);
  } catch (e) { next(e); }
}
