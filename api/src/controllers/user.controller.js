import * as UserService from "../services/user.service.js";

export async function getAll(req, res, next) {
  try {
    const users = await UserService.getAllUsers();
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
    const newUser = await UserService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
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

export async function activateUser(req, res, next) {
  try {
    const user = await UserService.activateUser(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await UserService.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(204).send();
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
