// src/controllers/auth.controller.js
import * as AuthService from "../services/auth.service.js";
import { buildAbility } from "../casl/ability.js";

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
    // 1. Tu servicio de login ya hace validaciones y regresa: { user, token }
    const { user, token } = await AuthService.login(req.body);

    // 2. Obtener permisos por rol
    const permissionKeys = await AuthService.getUserPermissions(user.role_id);

    // 3. Construir ability
    const ability = buildAbility(permissionKeys);

    // 4. Responder con TODO lo que el frontend necesita
    res.json({
      user,
      token,
      permissions: permissionKeys, // Opcional pero útil
      ability: ability.rules        // 👈 Esto es lo que usa CASL en React
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Perfil del usuario autenticado
export async function me(req, res) {
  try {
    const { id, client_id, role_id } = req.user;

    const user = await AuthService.getProfile(id, client_id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Permisos del rol
    const permissionKeys = await AuthService.getUserPermissions(role_id);

    res.json({
      user,
      permissions: permissionKeys
    });

  } catch (err) {
    console.error("Error en /me:", err);
    res.status(400).json({ error: err.message });
  }
}


