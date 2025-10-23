// src/controllers/auth.controller.js
import * as AuthService from "../services/auth.service.js";

/** Registro */
export async function register(req, res) {
  try {
    const data = await AuthService.register(req.body, req.user?.client_id || null);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Login */
export async function login(req, res) {
  try {
    const data = await AuthService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/** Perfil del usuario autenticado */
export async function me(req, res) {
  try {
    const { id, client_id } = req.user;
    const user = await AuthService.getProfile(id, client_id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
