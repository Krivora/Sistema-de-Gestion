import * as NotesRepo from "../repositories/adjustmentNotes.repository.js";

export async function listNotes(clientId, type) {
  return await NotesRepo.findAll(clientId, type);
}

export async function createNote(clientId, data) {
  if (!data.label?.trim()) throw new Error("El nombre de la nota es requerido");
  return await NotesRepo.create(clientId, data);
}

export async function deleteNote(clientId, id) {
  await NotesRepo.softDelete(clientId, id);
}

export async function restoreNote(clientId, id) {
  await NotesRepo.restore(clientId, id);
}
