import * as PermRepo from "../../modules/permission/permission.repository.js";
import { buildAbility } from "../casl/ability.js";

export async function attachPermissions(req, res, next) {
  try {
    const permissions = await PermRepo.findKeysByRoleId(req.user.role_id);
    req.ability = buildAbility(permissions);
    next();
  } catch (err) {
    next(err);
  }
}