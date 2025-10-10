import * as AuthService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const data = await AuthService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res, next) {
  try {
    const data = await AuthService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function me(req, res, next) {
  try {
    const user = await AuthService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
