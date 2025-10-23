import * as ActivityRepo from "../repositories/activity.repository.js";

export async function listLogs(clientId, filters) {
  return await ActivityRepo.findAll(clientId, filters);
}
