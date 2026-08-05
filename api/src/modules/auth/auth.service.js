import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as AuthRepo from "./auth.repository.js";
import * as UserRepo from "../user/user.repository.js";
import * as PermRepo from "../permission/permission.repository.js";
import * as ClientRepo from "../client/client.repository.js";
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

  if (!finalClientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });

  const existing = await AuthRepo.findByEmail(email);
  if (existing) throw Object.assign(new Error("El correo ya está registrado"), { status: 409 });

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
  if (!user) throw Object.assign(new Error(INVALID_MSG), { status: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw Object.assign(new Error(INVALID_MSG), { status: 401 });

  // Ojo: es el estado de ESTA persona, distinto de la suspensión por cobranza
  // de toda la empresa que se evalúa más abajo.
  if (user.status !== "active")
    throw Object.assign(
      new Error("Tu usuario está desactivado. Contacta al administrador de tu empresa."),
      { status: 403 }
    );

  // Cobranza: el usuario SÍ entra, pero se le devuelve el estado para que la
  // app le muestre el aviso de pago. El bloqueo real de datos lo aplica
  // blockSuspendedClient en cada petición; aquí solo se informa.
  //
  // El superadmin no pertenece a ningún cliente (client_id null): se salta esta
  // verificación a propósito, para que un corte por falta de pago nunca pueda
  // dejarlo fuera de su propio sistema.
  let billing = null;

  if (user.client_id && user.role_name !== "superadmin") {
    const status = await ClientRepo.findBillingStatus(user.client_id);

    // Vencido y sin prórroga: se suspende en el momento en que intenta entrar.
    // No hay tareas programadas en el proyecto, así que este es uno de los dos
    // puntos donde el corte se vuelve real.
    if (status?.is_active && status.is_delinquent && !status.has_grace) {
      await ClientRepo.suspendDelinquentClients();
      status.is_active = false;
      status.suspended_for_payment = true;

      await logAction({
        ...meta, client_id: user.client_id, user_id: user.id,
        action: "SUSPEND_CLIENT_NONPAYMENT",
        description: `Cliente ${status.name} suspendido automáticamente por corte vencido`,
        ref_table: "clients", ref_id: user.client_id,
      });
    }

    if (status) {
      billing = {
        suspended: !status.is_active,
        for_nonpayment: status.suspended_for_payment,
        pending_cycles: status.pending_cycles,
        oldest_unpaid_due: status.oldest_unpaid_due,
        grace_until: status.grace_until,
      };
    }
  }

  const permissions = await PermRepo.findKeysByRoleId(user.role_id);
  const token = signToken({ id: user.id, client_id: user.client_id, role_id: user.role_id, role_name: user.role_name });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "LOGIN",
    description: `Usuario "${user.name}" inició sesión`,
    ref_table: "users", ref_id: user.id,
  });

  return { user: { ...buildUserPayload(user), permissions }, token, billing };
}

export async function getProfile(userId, clientId) {
  const user = clientId
    ? await UserRepo.findById(userId, clientId)
    : await UserRepo.findByIdNoClient(userId);

  if (!user) throw Object.assign(new Error("Usuario no encontrado"), { status: 404 });

  const permissions = await PermRepo.findKeysByRoleId(user.role_id);
  return { ...user, permissions };
}

export async function getUserPermissions(roleId) {
  return PermRepo.findKeysByRoleId(roleId);
}