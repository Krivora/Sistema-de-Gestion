import * as ActivityService from "./activity.service.js";

export async function list(req, res, next) {
  try {
    const { user_id, action, date_from, date_to } = req.query;
    const data = await ActivityService.listLogs(req.user.client_id, {
      user_id, action, date_from, date_to,
    });
    res.json(data);
  } catch (err) { next(err); }
}