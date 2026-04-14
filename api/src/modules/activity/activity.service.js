import * as Repo from "./activity.repository.js";

export async function getAll(query) {
  const { limit = 50, offset = 0, ...filters } = query;
  return Repo.findAll({ ...filters, limit: +limit, offset: +offset });
}

export async function getById(id) {
  const log = await Repo.findById(id);
  if (!log) throw Object.assign(new Error("Registro no encontrado"), { status: 404 });
  return log;
}

export async function getByEntity(ref_table, ref_id) {
  return Repo.findByEntity(ref_table, ref_id);
}

export async function getStats(query) {
  const from = query.from ?? new Date(Date.now() - 30 * 86400000).toISOString();
  const to   = query.to   ?? new Date().toISOString();
  return Repo.getStats(from, to);
}