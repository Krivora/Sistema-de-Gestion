import * as PackageService from "./package.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function list(req, res, next) {
  try {
    res.json(await PackageService.listPackages(req.user.client_id, req.user.role_name));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const pkg = await PackageService.getPackage(req.params.id, req.user.client_id, req.user.role_name);
    if (!pkg) return res.status(404).json({ error: "Paquete no encontrado" });
    res.json(pkg);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(
      await PackageService.addPackage(req.body, req.user, extractRequestMeta(req))
    );
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    res.json(
      await PackageService.editPackage(+req.params.id, req.body, req.user, extractRequestMeta(req))
    );
  } catch (err) { next(err); }
}

export async function activate(req, res, next) {
  try {
    const pkg = await PackageService.activatePackage(+req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Paquete "${pkg.name}" activado`, package: pkg });
  } catch (err) { next(err); }
}

export async function deactivate(req, res, next) {
  try {
    const pkg = await PackageService.deactivatePackage(+req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Paquete "${pkg.name}" desactivado`, package: pkg });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const pkg = await PackageService.deletePackage(+req.params.id, req.user, extractRequestMeta(req));
    res.json({ success: true, message: `Paquete "${pkg.name}" eliminado`, package: pkg });
  } catch (err) { next(err); }
}
