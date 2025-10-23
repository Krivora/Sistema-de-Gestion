// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido o malformado" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contiene id, client_id, role_id, role_name
    next();
  } catch (err) {
    res.status(401).json({ error: "Token expirado o inválido" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role_name)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
}
