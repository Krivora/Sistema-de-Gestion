import * as TransferService from "./transfer.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function getAll(req, res, next) {
  try {
    const { from_branch_id, to_branch_id, date_from, date_to } = req.query;
    res.json(await TransferService.listTransfers(req.user.client_id, { from_branch_id, to_branch_id, date_from, date_to }));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const transfer = await TransferService.getTransferById(req.params.id, req.user.client_id);
    if (!transfer) return res.status(404).json({ error: "Transferencia no encontrada" });
    res.json(transfer);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { from_branch_id, to_branch_id, note, items } = req.body;
    if (!from_branch_id || !to_branch_id || !items) {
      return res.status(400).json({ error: "from_branch_id, to_branch_id e items son requeridos" });
    }
    res.status(201).json(
      await TransferService.createAndPostTransfer(
        { from_branch_id, to_branch_id, note, items },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}