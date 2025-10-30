import * as UserService from "../services/user.service.js";

export async function getAll(req, res, next) {
  try {
    const { status = "active" } = req.query; // 👈 valor por defecto
    const users = await UserService.getAllUsers(req.user.client_id, req.user.role_name, status);
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const newUser = await UserService.createUser(
      req.body,              // 🔹 datos del nuevo usuario
      req.user.client_id,    // 🔹 client_id desde el token/session
      req.user.role_name     // 🔹 rol del usuario autenticado
    );

    res.status(201).json(newUser);
  } catch (err) {
    // 🔸 Error claro cuando se supera el límite de usuarios
    if (err.status === 400) {
      return res.status(400).json({ error: err.message });
    }

    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await UserService.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req, res, next) {
  try {
    const user = await UserService.deactivateUser(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await UserService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// ✅ Actualizar modo oscuro
export async function updateDarkMode(req, res, next) {
  try {
    const { darkMode } = req.body;
    if (typeof darkMode !== "boolean") {
      return res.status(400).json({ error: "darkMode debe ser booleano" });
    }

    const updated = await UserService.changeDarkMode(req.params.id, darkMode);
    if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
