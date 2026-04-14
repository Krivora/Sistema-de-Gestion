import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as AuthRepo from "./auth.repository.js";
import * as UserRepo from "../user/user.repository.js";
import * as PermRepo from "../permission/permission.repository.js";
import pool from "../../config/db.js";
import { logAction } from "../../core/utils/audit.js";

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "1d";

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function buildUserPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role_name,
    branch_id: user.branch_id,
    client_id: user.client_id,
    dark_mode: user.dark_mode,
    business_name: user.business_name,
    logo_url: user.logo_url,
    phone: user.phone,
  };
}

export async function register(data, clientContext = null, meta = {}) {
  const { email, password, role_id, branch_id, client_id, name } = data;
  const finalClientId = clientContext || client_id;

  if (!finalClientId) throw new Error("client_id requerido");

  const existing = await AuthRepo.findByEmail(email);
  if (existing) throw new Error("El correo ya está registrado");

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserRepo.create({ name, email, password: hashed, role_id, branch_id, client_id: finalClientId });

  const { rows } = await pool.query("SELECT name FROM roles WHERE id = $1", [role_id]);
  const role_name = rows[0]?.name || "unknown";

  const token = signToken({ id: user.id, client_id: finalClientId, role_id, role_name });

  const { password: _pw, ...safeUser } = user;

  await logAction({
    ...meta, client_id: finalClientId, user_id: user.id,
    action: "REGISTER",
    description: `Usuario "${user.name}" registrado`,
    ref_table: "users", ref_id: user.id,
    new_data: safeUser,
  });

  return { user, token };
}

export async function login({ email, password }, meta = {}) {
  const INVALID_MSG = "Credenciales inválidas";

  const user = await AuthRepo.findByEmail(email);
  if (!user) throw new Error(INVALID_MSG);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error(INVALID_MSG);

  if (user.status !== "active") throw new Error("Cuenta inactiva. Contacte al administrador.");

  const permissions = await PermRepo.findKeysByRoleId(user.role_id);
  const token = signToken({ id: user.id, client_id: user.client_id, role_id: user.role_id, role_name: user.role_name });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "LOGIN",
    description: `Usuario "${user.name}" inició sesión`,
    ref_table: "users", ref_id: user.id,
  });

  return { user: { ...buildUserPayload(user), permissions }, token };
}

export async function getProfile(userId, clientId) {
  const user = clientId
    ? await UserRepo.findById(userId, clientId)
    : await UserRepo.findByIdNoClient(userId);

  if (!user) throw new Error("Usuario no encontrado");

  const permissions = await PermRepo.findKeysByRoleId(user.role_id);
  return { ...user, permissions };
}

export async function getUserPermissions(roleId) {
  return PermRepo.findKeysByRoleId(roleId);
}