import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/index.js";

const app = express();
// Seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: false, // 👈 importante para servir /uploads
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "http://localhost:4000"],
      },
    },
  })
);


app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
// ❗ JSON parser con excepción para multipart/form-data
app.use((req, res, next) => {
  if (req.originalUrl.includes("/clients") && req.originalUrl.endsWith("/logo")) {
    return next();
  }
  express.json()(req, res, next);
});
// URL encoded
app.use(express.urlencoded({ extended: true }));
// Rutas
app.use("/api", routes);
// Archivos estáticos
app.use("/uploads", express.static("uploads"));
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});
export default app;
