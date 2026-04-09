export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    // fix: era req.user.role, debe ser req.user.role_name
    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
}