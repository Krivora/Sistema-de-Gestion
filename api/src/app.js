import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();

/**
 * Orígenes permitidos
 * Se limpian espacios para evitar errores en la comparación.
 */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : [];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:"],
      },
    },
  })
);

/**
 * Configuración de CORS
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir herramientas como Postman o solicitudes sin origin
      if (!origin) return callback(null, true);

      // En desarrollo, permitir cualquier origen
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Validar contra la lista permitida
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Archivos estáticos
app.use("/uploads", express.static("uploads"));

// Rutas principales
app.use("/api", routes);

// Endpoint de verificación
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Handler global de errores
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const isClientError = status >= 400 && status < 500;

  if (isClientError) {
    // Errores de negocio: son esperados, no fallas. Una línea basta y evita
    // llenar el log de stack traces por un stock insuficiente.
    console.warn(`⚠️  ${status} ${req.method} ${req.originalUrl} — ${err.message}`);
  } else {
    console.error("🔥 ERROR GLOBAL:", err);
  }

  // Los 4xx llevan mensajes escritos para el usuario ("Faltan $200.00 por
  // abonar", "Stock insuficiente") y tienen que llegarle tal cual. Solo se
  // enmascaran los 5xx, que sí pueden filtrar detalles internos.
  const message =
    isClientError || process.env.NODE_ENV !== "production"
      ? err.message
      : "Error interno";

  res.status(status).json({ error: message });
});

export default app;