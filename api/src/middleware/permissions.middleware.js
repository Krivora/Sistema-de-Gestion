import { getUserPermissions } from "../services/auth.service.js";
import { buildAbility } from "../casl/ability.js";

export async function attachPermissions(req, res, next) {
  try {
    const roleId = req.user.role_id;

    const userPermissions = await getUserPermissions(roleId);
    req.ability = buildAbility(userPermissions);

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando permisos" });
  }
}
