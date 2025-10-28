import * as BranchProductService from "../services/branchProduct.service.js";


// 📋 Listar todos los productos por sucursales
export async function getAll(req, res, next) {
  try {
    const rows = await BranchProductService.listAllBranchProducts(
      req.user.client_id,     // 👈 cliente actual
      req.user.role_name      // 👈 rol del usuario (admin / superadmin)
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// 📍 Listar productos por sucursal
export async function getByBranch(req, res, next) {
  try {
    const rows = await BranchProductService.listByBranch(
      req.params.branchId,
      req.user.client_id,     // 👈 cliente actual
      req.user.role_name      // 👈 rol del usuario
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// 🔍 Obtener un producto de sucursal por ID
export async function getOne(req, res, next) {
  try {
    const row = await BranchProductService.getBranchProduct(
      req.params.id,
      req.user.client_id,     // 👈 cliente actual
      req.user.role_name      // 👈 rol del usuario
    );

    if (!row) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

// ➕ Crear
export async function create(req, res, next) {
  try {
    const row = await BranchProductService.addBranchProduct(req.body);

    // 🧩 Traer con joins (nombre de producto y sucursal)
    const enriched = await BranchProductService.getBranchProduct(row.id);

    res.status(201).json(enriched);
  } catch (err) {
    next(err);
  }
}

// Actualizar
export async function update(req, res, next) {
  try {
    const row = await BranchProductService.editBranchProduct(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: "Registro no encontrado" });

    // 🧩 Igual: devuelve con joins
    const enriched = await BranchProductService.getBranchProduct(row.id);

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

// 🔄 Cambiar estado (activar/desactivar)
export async function toggleStatus(req, res, next) {
  try {
    const row = await BranchProductService.toggleBranchProductStatus(
      req.params.id,
      req.body.is_active
    );
    if (!row) return res.status(404).json({ error: "Registro no encontrado" });

    // 🧩 Traer el registro completo con JOINs (producto + sucursal)
    const enriched = await BranchProductService.getBranchProduct(row.id);

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}


// 🗑️ Eliminar
export async function remove(req, res, next) {
  try {
    const row = await BranchProductService.removeBranchProduct(req.params.id);
    if (!row) return res.status(404).json({ error: "Registro no encontrado" });
    res.json(row);
  } catch (err) {
    next(err);
  }
}
