import * as ClientRepo from "../repositories/client.repository.js";
import * as UserRepo from "../repositories/user.repository.js";
import bcrypt from "bcrypt";

// 📦 Obtener todos
export async function getAllClients() {
  return await ClientRepo.findAll();
}

// 🔍 Obtener uno
export async function getClientById(id) {
  return await ClientRepo.findById(id);
}
// 🧩 Crear cliente con código autogenerado y usuario admin principal
export async function createClient(data) {
  // 🆔 Generar código antes de crear
  const code = await generateClientCode();

  // Crear cliente
  const client = await ClientRepo.create({
    ...data,
    code,
  });

  // Crear usuario administrador principal
  const hashed = await bcrypt.hash(data.admin_password, 10);

  await UserRepo.create({
    name: data.admin_name,
    email: data.admin_email,
    password: hashed,
    role_id: 2, // id del rol "admin"
    client_id: client.id,
    branch_id: null,
  });

  return client;
}

// ✏️ Actualizar cliente
export async function updateClient(id, data) {
  const {
    admin_name,
    admin_email,
    admin_password,
    admin_role_id,
    ...clientData // solo datos del cliente
  } = data;

  return await ClientRepo.update(id, clientData);
}

// 🚫 Desactivar cliente
export async function deactivateClient(id) {
  // Cambia el estado del cliente (toggle)
  const client = await ClientRepo.deactivate(id);

  // Desactiva o activa también los usuarios vinculados
  await UserRepo.toggleByClient(id, client.is_active);

  return client;
}

// 🔢 Generador de códigos autoincrementales
async function generateClientCode() {
  const prefix = "CLI";
  const last = await ClientRepo.findLastCode();
  const next = last ? Number(last.replace(prefix + "-", "")) + 1 : 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}
