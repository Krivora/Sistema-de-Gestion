import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserRepo from "../repositories/user.repository.js";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * Registro de usuarios
 * - Solo debe usarse por superadmin o admin del cliente
 * - Asocia al cliente (client_id) y al rol correspondiente
 */
export async function register(data, clientContext = null) {
  const { email, password, role_id, branch_id, client_id, name } = data;

  // Si el token ya tiene client_id, usamos ese contexto
  const finalClientId = clientContext || client_id;
  if (!finalClientId) throw new Error("client_id requerido para registrar usuario");

  const existing = await UserRepo.findByEmail(email);
  if (existing) throw new Error("El correo ya está registrado.");

  const hashed = await bcrypt.hash(password, 10);

  const user = await UserRepo.create({
    name,
    email,
    password: hashed,
    role_id,
    branch_id,
    client_id: finalClientId,
  });

  // Obtener el nombre del rol
  const { rows: roleRows } = await pool.query("SELECT name FROM roles WHERE id = $1", [role_id]);
  const role_name = roleRows[0]?.name || "unknown";

  const token = jwt.sign(
    { id: user.id, client_id: finalClientId, role_id, role_name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
}

/**
 * Inicio de sesión
 * - Devuelve token con client_id y role_id
 */
export async function login({ email, password }) {
  const user = await UserRepo.findByEmail(email);
  if (!user) throw new Error("Usuario no encontrado.");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Contraseña incorrecta.");

  if (!user.status==='active') throw new Error("Usuario inactivo. Contacte al administrador.");

  const token = jwt.sign(
    {
      id: user.id,
      client_id: user.client_id,
      role_id: user.role_id,
      role_name: user.role_name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Solo devolvemos datos públicos
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      branch_id: user.branch_id,
      client_id: user.client_id,
    },
    token,
  };
}

/**
 * Perfil de usuario autenticado
 */
export async function getProfile(userId, clientId) {
  if (!userId) throw new Error("Datos de sesión incompletos");

  // Si es superadmin (sin client_id), buscar sin filtro de cliente
  const user = clientId
    ? await UserRepo.findById(userId, clientId)
    : await UserRepo.findByIdNoClient(userId); // 👈 Nueva función para superadmin

  if (!user) throw new Error("Usuario no encontrado");
  return user;
}


