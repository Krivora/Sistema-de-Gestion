import * as CatalogService from "./catalog.service.js";

export async function getCatalogs(req, res, next) {
  try {
    res.json(await CatalogService.listCatalogs(req.user.client_id));
  } catch (err) { next(err); }
}

export async function getItems(req, res, next) {
  try {
    res.json(await CatalogService.listItems(req.user.client_id, req.params.code));
  } catch (err) { next(err); }
}

export async function createItem(req, res, next) {
  try {
    const { label, value, metadata } = req.body;
    if (!label) return res.status(400).json({ error: "label es requerido" });

    const item = await CatalogService.createItem(
      req.user.client_id,
      req.params.code,
      { label, value, metadata, created_by: req.user.id }
    );
    res.status(201).json(item);
  } catch (err) { next(err); }
}

export async function updateItem(req, res, next) {
  try {
    const { label, value, metadata } = req.body;
    if (!label) return res.status(400).json({ error: "label es requerido" });

    res.json(await CatalogService.updateItem(req.params.id, req.user.client_id, { label, value, metadata }));
  } catch (err) { next(err); }
}

export async function removeItem(req, res, next) {
  try {
    await CatalogService.removeItem(req.params.id, req.user.client_id);
    res.json({ message: "Item eliminado" });
  } catch (err) { next(err); }
}

export async function restoreItem(req, res, next) {
  try {
    await CatalogService.restoreItem(req.params.id, req.user.client_id);
    res.json({ message: "Item restaurado" });
  } catch (err) { next(err); }
}