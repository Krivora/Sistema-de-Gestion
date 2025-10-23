import * as ClientService from "../services/client.service.js";

export async function getAll(req, res, next) {
  try {
    const data = await ClientService.getAllClients();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const data = await ClientService.getClientById(req.params.id);
    if (!data) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const client = await ClientService.createClient(req.body);
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updated = await ClientService.updateClient(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deactivate(req, res, next) {
  try {
    const client = await ClientService.deactivateClient(req.params.id);
    res.json(client);
  } catch (err) {
    next(err);
  }
}
