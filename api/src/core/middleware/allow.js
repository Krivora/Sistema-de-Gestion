export function allow(action, subject) {
  return (req, res, next) => {
    if (!req.ability) {
      return res.status(500).json({ error: "Ability no inicializada" });
    }

    if (!req.ability.can(action, subject)) {
      return res.status(403).json({ error: "No tienes permiso para realizar esta acción" });
    }

    next();
  };
}
