import * as CustomerRepo from "./customer.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function getAll(clientId) {
  return CustomerRepo.findAll(clientId);
}

export async function getById(id, clientId) {
  return CustomerRepo.findById(id, clientId);
}
export async function create(data, user, meta = {}) {
  const { name, phone, email, address } = data;
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });

  const customer = await CustomerRepo.create({
    client_id: user.client_id,
    name: name.trim(),
    phone: phone ?? null,
    email: email ?? null,
    address: address ?? null,
  });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "CREATE_CUSTOMER",
    description: `Cliente "${customer.name}" creado`,
    ref_table: "customers", ref_id: customer.id,
    new_data: customer,
  });

  return customer;
}

export async function update(id, data, user, meta = {}) {
  const before = await CustomerRepo.findById(id, user.client_id);
  const updated = await CustomerRepo.update(id, user.client_id, data);
  if (!updated) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "UPDATE_CUSTOMER",
    description: `Cliente "${updated.name}" actualizado`,
    ref_table: "customers", ref_id: updated.id,
    old_data: before, new_data: updated,
  });

  return updated;
}

export async function activate(id, user, meta = {}) {
  const activated = await CustomerRepo.activate(id, user.client_id);
  if (!activated) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "ACTIVATE_CUSTOMER",
    description: `Cliente "${activated.name}" activado`,
    ref_table: "customers", ref_id: activated.id,
  });

  return activated;
}

export async function deactivate(id, user, meta = {}) {
  const deactivated = await CustomerRepo.deactivate(id, user.client_id);
  if (!deactivated) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "DEACTIVATE_CUSTOMER",
    description: `Cliente "${deactivated.name}" desactivado`,
    ref_table: "customers", ref_id: deactivated.id,
  });

  return deactivated;
}

export async function remove(id, user, meta = {}) {
  const deleted = await CustomerRepo.softDelete(id, user.client_id);
  if (!deleted) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "DELETE_CUSTOMER",
    description: `Cliente "${deleted.name}" eliminado`,
    ref_table: "customers", ref_id: deleted.id,
    old_data: deleted,
  });

  return deleted;
}