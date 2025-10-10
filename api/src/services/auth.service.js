import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as UserRepo from "../repositories/user.repository.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function register(data) {
  const existing = await UserRepo.findByEmail(data.email);
  if (existing) throw new Error("El correo ya está registrado.");

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await UserRepo.create({
    ...data,
    password: hashed,
  });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  return { user, token };
}

export async function login({ email, password }) {
  const user = await UserRepo.findByEmail(email);
  if (!user) throw new Error("Usuario no encontrado.");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Contraseña incorrecta.");

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, branch_id: user.branch_id },
    token,
  };
}

export async function getProfile(id) {
  return await UserRepo.findById(id);
}
