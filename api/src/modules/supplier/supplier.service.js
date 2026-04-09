import * as SupplierRepo from "./supplier.repository.js";
import { logAction } from "../../core/utils/audit.js";

export async function getAll(clientId) {
  return SupplierRepo.findAll(clientId);
}

export async function getById(id, clientId) {
  return SupplierRepo.findById(id, clientId);
}

export async function create(data, user) {
  const { name, phone, email, address } = data;
  if (!name?.trim()) throw Object.assign(new Error("El nombre es requerido"), { status: 400 });

  const supplier = await SupplierRepo.create({
    client_id: user.client_id,
    name: name.trim(), phone: phone ?? null,
    email: email ?? null, address: address ?? null,
  });

  await logAction({
    client_id: user.client_id, user_id: user.id,
    action: "CREATE_SUPPLIER",
    description: `Proveedor "${supplier.name}" creado`,
    ref_table: "suppliers", ref_id: supplier.id,
  });

  return supplier;
}

export async function update(id, data, user) {
  const updated = await SupplierRepo.update(id, user.client_id, data);
  if (!updated) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  await logAction({
    client_id: user.client_id, user_id: user.id,
    action: "UPDATE_SUPPLIER",
    description: `Proveedor "${updated.name}" actualizado`,
    ref_table: "suppliers", ref_id: updated.id,
  });

  return updated;
}

export async function deactivate(id, user) {
  const deactivated = await SupplierRepo.deactivate(id, user.client_id);
  if (!deactivated) throw Object.assign(new Error("Proveedor no encontrado"), { status: 404 });

  await logAction({
    client_id: user.client_id, user_id: user.id,
    action: "DEACTIVATE_SUPPLIER",
    description: `Proveedor "${deactivated.name}" desactivado`,
    ref_table: "suppliers", ref_id: deactivated.id,
  });

  return deactivated;
}