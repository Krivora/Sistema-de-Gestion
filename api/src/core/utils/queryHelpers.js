/** Valores permitidos para filtrar status */
const VALID_STATUSES = ["active", "inactive", "deleted"];

export function buildStatusFilter(status, alias = "") {
  const col = alias ? `${alias}.status` : "status";
  if (!VALID_STATUSES.includes(status)) return { clause: "", params: [] };
  return { clause: ` AND ${col} = $`, status };
}