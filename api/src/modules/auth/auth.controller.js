import * as AuthService from "./auth.service.js";
import { buildAbility } from "../../core/casl/ability.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, role_id, branch_id, client_id } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ error: "Campos requeridos: name, email, password, role_id" });
    }
    const data = await AuthService.register({ name, email, password, role_id, branch_id, client_id }, req.user?.client_id ?? null);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }
    const { user, token } = await AuthService.login({ email, password });
    const ability = buildAbility(user.permissions);
    res.json({ user, token, ability: ability.rules });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const { id, client_id } = req.user;
    const user = await AuthService.getProfile(id, client_id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}