import * as ClientService from "./client.service.js";

export async function getAll(req, res, next) {
  try {
    res.json(await ClientService.getAllClients());
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const data = await ClientService.getClientById(req.params.id);
    if (!data) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { name, business_name, email, phone, max_users, max_branches,
            admin_name, admin_email, admin_password } = req.body;

    if (!name || !admin_email || !admin_password) {
      return res.status(400).json({ error: "name, admin_email y admin_password son requeridos" });
    }

    res.status(201).json(await ClientService.createClient({
      name, business_name, email, phone, max_users, max_branches,
      admin_name, admin_email, admin_password,
    }));
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    res.json(await ClientService.updateClient(req.params.id, req.body));
  } catch (err) { next(err); }
}

export async function deactivate(req, res, next) {
  try {
    res.json(await ClientService.deactivateClient(req.params.id));
  } catch (err) { next(err); }
}

export async function uploadLogo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "No se envió archivo" });

    const url = `/uploads/clients/${req.params.id}/${req.file.filename}`;
    const updated = await ClientService.updateClient(req.params.id, { logo_url: url });

    res.json({ url, client: updated });

  } catch (err) { 
    console.error("🔥 ERROR SUBIENDO LOGO:", err);
    next(err); 
  }
}