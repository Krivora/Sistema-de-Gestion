import pool from "../../config/db.js";

// Categorías por acción para clasificación automática
const ACTION_CATEGORY_MAP = {
  // Auth
  LOGIN: "auth", LOGOUT: "auth", LOGIN_FAILED: "auth", PASSWORD_CHANGE: "auth",
  // CRUD genérico
  CREATE: "data", UPDATE: "data", DELETE: "data", ACTIVATE: "data", DEACTIVATE: "data",
  // Inventario / Operaciones
  ADJUSTMENT: "inventory", TRANSFER: "inventory", PURCHASE: "inventory", SALE: "sale",
  // Configuración
  ROLE: "config", PERMISSION: "config", CLIENT: "config", BRANCH: "config",
};

const ACTION_SEVERITY_MAP = {
  DELETE: "warning", DEACTIVATE: "warning",
  LOGIN_FAILED: "warning",
  ADJUSTMENT: "info", TRANSFER: "info",
  PURCHASE: "info", SALE: "info",
};

function resolveCategory(action = "") {
  const prefix = Object.keys(ACTION_CATEGORY_MAP).find(k => action.includes(k));
  return prefix ? ACTION_CATEGORY_MAP[prefix] : "general";
}

function resolveSeverity(action = "") {
  const prefix = Object.keys(ACTION_SEVERITY_MAP).find(k => action.includes(k));
  return prefix ? ACTION_SEVERITY_MAP[prefix] : "info";
}

export async function logAction({
  client_id,
  user_id,
  action,
  description,
  ref_table,
  ref_id,
  old_data = null,
  new_data = null,
  metadata = null,
  status = "success",
  severity = null,
  category = null,
  ip_address = null,
  user_agent = null,
  duration_ms = null,
}) {
  try {
    await pool.query(
      `INSERT INTO activity_logs
        (client_id, user_id, action, description, ref_table, ref_id,
         old_data, new_data, metadata, status, severity, category,
         ip_address, user_agent, duration_ms)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        client_id, user_id, action, description ?? null,
        ref_table ?? null, ref_id ?? null,
        old_data ? JSON.stringify(old_data) : null,
        new_data ? JSON.stringify(new_data) : null,
        metadata ? JSON.stringify(metadata) : null,
        status,
        severity ?? resolveSeverity(action),
        category ?? resolveCategory(action),
        ip_address, user_agent, duration_ms,
      ]
    );
  } catch (e) {
    console.error("[activity_logs] error:", e.message);
  }
}

// Helper para capturar contexto HTTP fácil desde el controller
export function extractRequestMeta(req) {
  return {
    ip_address: req.ip || req.headers["x-forwarded-for"] || null,
    user_agent: req.headers["user-agent"] || null,
  };
}