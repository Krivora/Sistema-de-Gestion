import * as CustomerRepo from "./customer.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function getAll(clientId) {
  return CustomerRepo.findAll(clientId);
}

export async function getById(id, clientId) {
  return CustomerRepo.findById(id, clientId);
}

export async function create(data, user) {
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
    client_id: user.client_id, user_id: user.id,
    action: "CREATE_CUSTOMER",
    description: `Cliente "${customer.name}" creado`,
    ref_table: "customers", ref_id: customer.id,
  });

  return customer;
}

export async function update(id, data, user) {
  const updated = await CustomerRepo.update(id, user.client_id, data);
  if (!updated) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    client_id: user.client_id, user_id: user.id,
    action: "UPDATE_CUSTOMER",
    description: `Cliente "${updated.name}" actualizado`,
    ref_table: "customers", ref_id: updated.id,
  });

  return updated;
}

export async function deactivate(id, user) {
  const deactivated = await CustomerRepo.deactivate(id, user.client_id);
  if (!deactivated) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    client_id: user.client_id, user_id: user.id,
    action: "DEACTIVATE_CUSTOMER",
    description: `Cliente "${deactivated.name}" desactivado`,
    ref_table: "customers", ref_id: deactivated.id,
  });

  return deactivated;
}