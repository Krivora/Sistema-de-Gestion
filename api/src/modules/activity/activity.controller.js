import * as Service from "./activity.service.js";

export async function getAll(req, res, next) {
  try {
    const result = await Service.getAll(req.query);
    res.json(result);
  } catch (e) { next(e); }
}

export async function getById(req, res, next) {
  try {
    const id = +req.params.id;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "ID inválido" });
    const log = await Service.getById(id);
    res.json(log);
  } catch (e) { next(e); }
}

export async function getByEntity(req, res, next) {
  try {
    const { ref_table, ref_id } = req.params;
    const logs = await Service.getByEntity(ref_table, +ref_id);
    res.json(logs);
  } catch (e) { next(e); }
}

export async function getStats(req, res, next) {
  try {
    const stats = await Service.getStats(req.query);
    res.json(stats);
  } catch (e) { next(e); }
}