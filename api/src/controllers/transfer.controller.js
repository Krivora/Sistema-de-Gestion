import * as TransferService from "../services/transfer.service.js";

export async function getAll(req, res, next) {
  try {
    const data = await TransferService.getAllTransfers(req.user.client_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const transfer = await TransferService.getTransferById(req.params.id, req.user.client_id);
    if (!transfer) return res.status(404).json({ error: "Transferencia no encontrada" });
    res.json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const transfer = await TransferService.createTransfer(req.body, req.user);
    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
