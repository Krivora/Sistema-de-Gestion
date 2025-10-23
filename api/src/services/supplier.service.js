import * as SupplierRepo from "../repositories/supplier.repository.js";
import { logAction } from "../utils/audit.js";

export async function getAll(clientId) {
  return await SupplierRepo.findAll(clientId);
}

export async function getById(id, clientId) {
  return await SupplierRepo.findById(id, clientId);
}

export async function create(data, user) {
  const supplier = await SupplierRepo.create({ ...data, client_id: user.client_id });
  await logAction({
    client_id: user.client_id,
    user_id: user.id,
    action: "CREATE_SUPPLIER",
    description: `Proveedor ${supplier.name} creado`,
    ref_table: "suppliers",
    ref_id: supplier.id,
  });
  return supplier;
}

export async function update(id, data, user) {
  const updated = await SupplierRepo.update(id, user.client_id, data);
  await logAction({
    client_id: user.client_id,
    user_id: user.id,
    action: "UPDATE_SUPPLIER",
    description: `Proveedor ${updated.name} actualizado`,
    ref_table: "suppliers",
    ref_id: updated.id,
  });
  return updated;
}

export async function deactivate(id, user) {
  const deactivated = await SupplierRepo.deactivate(id, user.client_id);
  await logAction({
    client_id: user.client_id,
    user_id: user.id,
    action: "DEACTIVATE_SUPPLIER",
    description: `Proveedor ${deactivated.name} desactivado`,
    ref_table: "suppliers",
    ref_id: deactivated.id,
  });
  return deactivated;
}
