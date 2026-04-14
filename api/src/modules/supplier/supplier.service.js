import * as SupplierRepo from "./supplier.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function getAll(clientId) {
  return SupplierRepo.findAll(clientId);
}

export async function getById(id, clientId) {
  return SupplierRepo.findById(id, clientId);
}

export async function create(data, user, meta = {}) {
  const { name, phone, email, address } = data;
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });

  const supplier = await SupplierRepo.create({
    client_id: user.client_id,
    name: name.trim(), phone: phone ?? null,
    email: email ?? null, address: address ?? null,
  });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "CREATE_SUPPLIER",
    description: `Proveedor "${supplier.name}" creado`,
    ref_table: "suppliers", ref_id: supplier.id,
    new_data: supplier,
  });

  return supplier;
}

export async function update(id, data, user, meta = {}) {
  const before = await SupplierRepo.findById(id, user.client_id);
  if (!before) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  const updated = await SupplierRepo.update(id, user.client_id, data);
  if (!updated) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "UPDATE_SUPPLIER",
    description: `Proveedor "${updated.name}" actualizado`,
    ref_table: "suppliers", ref_id: updated.id,
    old_data: before, new_data: updated,
  });

  return updated;
}

export async function activate(id, user, meta = {}) {
  const before = await SupplierRepo.findById(id, user.client_id);
  if (!before) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  const activated = await SupplierRepo.activate(id, user.client_id);
  if (!activated) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "ACTIVATE_SUPPLIER",
    description: `Proveedor "${activated.name}" activado`,
    ref_table: "suppliers", ref_id: activated.id,
    old_data: before, new_data: activated,
  });

  return activated;
}

export async function deactivate(id, user, meta = {}) {
  const before = await SupplierRepo.findById(id, user.client_id);
  if (!before) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  const deactivated = await SupplierRepo.deactivate(id, user.client_id);
  if (!deactivated) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "DEACTIVATE_SUPPLIER",
    description: `Proveedor "${deactivated.name}" desactivado`,
    ref_table: "suppliers", ref_id: deactivated.id,
    old_data: before,
  });

  return deactivated;
}

export async function remove(id, user, meta = {}) {
  const before = await SupplierRepo.findById(id, user.client_id);
  if (!before) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  const deleted = await SupplierRepo.softDelete(id, user.client_id);
  if (!deleted) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "DELETE_SUPPLIER",
    description: `Proveedor "${deleted.name}" eliminado`,
    ref_table: "suppliers", ref_id: deleted.id,
    old_data: before,
  });

  return deleted;
}