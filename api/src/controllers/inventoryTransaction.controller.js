import * as service from "../services/inventoryTransaction.service.js";

export async function list(req, res) {
  try {
    const { branch_id, product_id } = req.query;
    const data = await service.list({ branch_id, product_id });
    res.json(data);
  } catch (err) {
    console.error("Error al listar movimientos:", err);
    res.status(500).json({ error: "Error interno al listar movimientos" });
  }
}

export async function getById(req, res) {
  try {
    const item = await service.getById(req.params.id);
    if (!item) return res.status(404).json({ error: "Movimiento no encontrado" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Error interno al obtener el movimiento" });
  }
}

export async function create(req, res) {
  try {
    const created = await service.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error al crear movimiento:", err);
    res.status(500).json({ error: "Error interno al crear movimiento" });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await service.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Movimiento no encontrado" });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: "Error interno al eliminar movimiento" });
  }
}

export async function getStock(req, res) {
  try {
    const { branch_id, product_id } = req.query;
    if (!branch_id || !product_id)
      return res.status(400).json({ error: "Faltan branch_id y product_id" });

    const stock = await service.getStock(branch_id, product_id);
    res.json({ stock });
  } catch (err) {
    res.status(500).json({ error: "Error interno al obtener stock" });
  }
}
