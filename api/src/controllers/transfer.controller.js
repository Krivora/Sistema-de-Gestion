import * as TransferService from "../services/transfer.service.js";

/**
 * 📋 Listar transferencias
 */
export async function getAll(req, res, next) {
  try {
    const data = await TransferService.listTransfers(req.user.client_id, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * 🔍 Obtener transferencia por ID
 */
export async function getById(req, res, next) {
  try {
    const transfer = await TransferService.getTransferById(
      req.params.id,
      req.user.client_id
    );
    if (!transfer)
      return res.status(404).json({ error: "Transferencia no encontrada" });
    res.json(transfer);
  } catch (err) {
    next(err);
  }
}

/**
 * 🧩 Crear y publicar transferencia
 */
export async function create(req, res, next) {
  try {
    const transfer = await TransferService.createAndPostTransfer(req.body, req.user);
    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}