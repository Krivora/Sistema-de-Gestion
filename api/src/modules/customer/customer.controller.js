import * as CustomerService from "./customer.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function list(req, res, next) {
  try {
    res.json(await CustomerService.getAll(req.user.client_id));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const data = await CustomerService.getById(req.params.id, req.user.client_id);
    if (!data) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es requerido" });
    res.status(201).json(await CustomerService.create({ name, phone, email, address }, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    res.json(await CustomerService.update(req.params.id, req.body, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function activate(req, res, next) {
  try {
    res.json(await CustomerService.activate(req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function deactivate(req, res, next) {
  try {
    res.json(await CustomerService.deactivate(req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    res.json(await CustomerService.remove(req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}