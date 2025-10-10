import * as PurchaseService from "../services/purchase.service.js";

// 🔹 GET /purchases
export async function getPurchases(req, res, next) {
  try {
    const data = await PurchaseService.listPurchases();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// 🔹 GET /purchases/:id
export async function getPurchase(req, res, next) {
  try {
    const purchase = await PurchaseService.getPurchase(req.params.id);
    if (!purchase)
      return res.status(404).json({ error: "Compra no encontrada" });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
}

// 🔹 POST /purchases
export async function createPurchase(req, res, next) {
  try {
    const purchase = await PurchaseService.createPurchase(req.body);
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
}

// 🔹 DELETE /purchases/:id
export async function deletePurchase(req, res, next) {
  try {
    const purchase = await PurchaseService.removePurchase(req.params.id);
    if (!purchase)
      return res.status(404).json({ error: "Compra no encontrada" });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
}
