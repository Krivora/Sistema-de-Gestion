import * as ActivityRepo from "./activity.repository.js";

export async function listLogs(clientId, filters) {
  if (!clientId) throw new Error("client_id requerido");
  return ActivityRepo.findAll(clientId, filters);
}