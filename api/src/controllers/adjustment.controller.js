import * as AdjustmentService from "../services/adjustment.service.js";

/**
 * 🧩 POST /api/adjustments
 * Crear y publicar un ajuste multiproducto
 */
export async function createAndPost(req, res) {
  try {
    const user = req.user; // viene del middleware de autenticación
    const data = req.body;

    const result = await AdjustmentService.createAndPostAdjustment(data, user);

    return res.status(201).json({
      success: true,
      message: "Ajuste creado correctamente",
      data: result,
    });
  } catch (err) {
    console.error("Error creando ajuste:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Error al crear el ajuste",
    });
  }
}

/**
 * 📋 GET /api/adjustments
 * Listar ajustes con filtros opcionales
 */
export async function list(req, res) {
  try {
    const client_id = req.user.client_id;
    const filters = {
      branch_id: req.query.branch_id,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    };

    const adjustments = await AdjustmentService.listAdjustments(client_id, filters);

    return res.json({
      success: true,
      data: adjustments,
    });
  } catch (err) {
    console.error("Error listando ajustes:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error al listar los ajustes",
    });
  }
}

/**
 * 🔍 GET /api/adjustments/:id
 * Obtener un ajuste con sus productos
 */
export async function getById(req, res) {
  try {
    const client_id = req.user.client_id;
    const { id } = req.params;

    const adjustment = await AdjustmentService.getAdjustmentById(id, client_id);

    if (!adjustment)
      return res.status(404).json({
        success: false,
        message: "Ajuste no encontrado",
      });

    return res.json({
      success: true,
      data: adjustment,
    });
  } catch (err) {
    console.error("Error obteniendo ajuste:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error al obtener el ajuste",
    });
  }
}
