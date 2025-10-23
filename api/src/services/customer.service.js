import * as CustomerRepo from "../repositories/customer.repository.js";
import { logAction } from "../utils/audit.js";

export async function getAll(clientId) {
  return await CustomerRepo.findAll(clientId);
}

export async function getById(id, clientId) {
  return await CustomerRepo.findById(id, clientId);
}

export async function create(data, user) {
  const customer = await CustomerRepo.create({ ...data, client_id: user.client_id });
  await logAction({
    client_id: user.client_id,
    user_id: user.id,
    action: "CREATE_CUSTOMER",
    description: `Cliente ${customer.name} creado`,
    ref_table: "customers",
    ref_id: customer.id,
  });
  return customer;
}

export async function update(id, data, user) {
  const updated = await CustomerRepo.update(id, user.client_id, data);
  await logAction({
    client_id: user.client_id,
    user_id: user.id,
    action: "UPDATE_CUSTOMER",
    description: `Cliente ${updated.name} actualizado`,
    ref_table: "customers",
    ref_id: updated.id,
  });
  return updated;
}

export async function deactivate(id, user) {
  const deactivated = await CustomerRepo.deactivate(id, user.client_id);
  await logAction({
    client_id: user.client_id,
    user_id: user.id,
    action: "DEACTIVATE_CUSTOMER",
    description: `Cliente ${deactivated.name} desactivado`,
    ref_table: "customers",
    ref_id: deactivated.id,
  });
  return deactivated;
}
