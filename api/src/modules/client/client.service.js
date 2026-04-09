import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import * as ClientRepo from "./client.repository.js";
import * as UserRepo from "../user/user.repository.js";
import { seedDefaultCatalogs } from "../../core/utils/seedDefaultCatalogs.js";

const SALT_ROUNDS = 12;
const ADMIN_ROLE_ID = 2; // considera mover esto a una constante o config

async function generateClientCode() {
  const last = await ClientRepo.findLastCode();
  const next = last ? Number(last.replace("CLI-", "")) + 1 : 1;
  return `CLI-${String(next).padStart(4, "0")}`;
}

export async function getAllClients() {
  return ClientRepo.findAll();
}

export async function getClientById(id) {
  return ClientRepo.findById(id);
}

export async function createClient(data) {
  const { name, business_name, email, phone, max_users, max_branches,
          admin_name, admin_email, admin_password } = data;

  if (!name)           throw Object.assign(new Error("name es requerido"), { status: 400 });
  if (!admin_email)    throw Object.assign(new Error("admin_email es requerido"), { status: 400 });
  if (!admin_password) throw Object.assign(new Error("admin_password es requerido"), { status: 400 });

  const code = await generateClientCode();
  const hashed = await bcrypt.hash(admin_password, SALT_ROUNDS);

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const createdClient = await ClientRepo.create(
      { code, name, business_name, email, phone, max_users, max_branches },
      trx
    );

    await UserRepo.create({
      name: admin_name ?? name,
      email: admin_email,
      password: hashed,
      role_id: ADMIN_ROLE_ID,
      client_id: createdClient.id,
      branch_id: null,
    }, trx);

    await seedDefaultCatalogs(trx, createdClient.id);

    await trx.query("COMMIT");
    return createdClient;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

export async function updateClient(id, data) {
  // Nunca pasar campos de admin al repo de cliente
  const { admin_name, admin_email, admin_password, admin_role_id, ...clientData } = data;
  const updated = await ClientRepo.update(id, clientData);
  if (!updated) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });
  return updated;
}

export async function deactivateClient(id) {
  const existing = await ClientRepo.findById(id);
  if (!existing) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  // Acción explícita de desactivar — no toggle
  const client = await ClientRepo.setActive(id, false);

  // Desactivar usuarios vinculados
  await UserRepo.setStatusByClient(id, false);

  return client;
}