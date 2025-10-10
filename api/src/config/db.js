// src/config/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

// Configuración SSL (DigitalOcean requiere sslmode=require)
const ssl =
  process.env.PG_SSL && ["1", "true", "TRUE", "require"].includes(process.env.PG_SSL)
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  keepAlive: true,
  ssl,
});

// Logs útiles
pool.on("error", (err) => {
  console.error("[PG] Pool error:", err);
});

// Probar conexión al arrancar
(async () => {
  try {
    await pool.query("SELECT NOW()");
    if (process.env.NODE_ENV !== "test") {
      console.log("[PG] ✅ Conexión OK");
    }
  } catch (err) {
    console.error("[PG] ❌ Error al conectar:", err.message);
  }
})();

// Cierre limpio al terminar el proceso
const shutdown = async (signal) => {
  try {
    await pool.end();
    console.log("[PG] Pool cerrado por", signal);
  } catch (e) {
    console.error("[PG] Error cerrando pool:", e.message);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default pool;
