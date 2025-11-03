import * as AdjustmentNotesService from "../services/adjustmentNotes.service.js";

export async function list(req, res) {
  try {
    const { client_id } = req.user;
    const { type } = req.query;
    const data = await AdjustmentNotesService.listNotes(client_id, type);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function create(req, res) {
  try {
    const { client_id } = req.user;
    const note = await AdjustmentNotesService.createNote(client_id, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function remove(req, res) {
  try {
    const { client_id } = req.user;
    await AdjustmentNotesService.deleteNote(client_id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function restore(req, res) {
  try {
    const { client_id } = req.user;
    await AdjustmentNotesService.restoreNote(client_id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
