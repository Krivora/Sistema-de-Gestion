import * as CatalogService from "../services/catalog.service.js";

/**
 * 📚 Listar todos los catálogos de un cliente
 */
export async function getCatalogs(req, res) {
  try {
    const clientId = req.user.client_id;
    const data = await CatalogService.listCatalogs(clientId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * 📦 Listar items de un catálogo
 */
export async function getItems(req, res) {
  try {
    const clientId = req.user.client_id;
    const { code } = req.params;
    const data = await CatalogService.listItems(clientId, code);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * ➕ Crear nuevo item
 */
export async function createItem(req, res) {
  try {
    const clientId = req.user.client_id;
    const { code } = req.params;
    const userId = req.user.id;
    const payload = { ...req.body, created_by: userId };

    const item = await CatalogService.createItem(clientId, code, payload);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * ✏️ Editar item
 */
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updated = await CatalogService.updateItem(id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * 🚫 Soft delete
 */
export async function removeItem(req, res) {
  try {
    const { id } = req.params;
    await CatalogService.removeItem(id);
    res.json({ message: "Item eliminado (soft delete)" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * ♻️ Restaurar
 */
export async function restoreItem(req, res) {
  try {
    const { id } = req.params;
    await CatalogService.restoreItem(id);
    res.json({ message: "Item restaurado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
