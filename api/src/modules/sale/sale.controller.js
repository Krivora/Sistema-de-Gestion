import * as SaleService from "./sale.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function list(req, res, next) {
  try {
    const { status, branch_id, date_from, date_to } = req.query;
    res.json(await SaleService.listSales(req.user.client_id, { status, branch_id, date_from, date_to }));
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const data = await SaleService.getSaleById(req.params.id, req.user.client_id);
    if (!data) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const { branch_id, items, customer_id, customer_name, customer_phone, payment_method, doc_no, post = false } = req.body;
    if (!branch_id || !items) return res.status(400).json({ error: "branch_id e items son requeridos" });
    res.status(201).json(
      await SaleService.createSale(
        { branch_id, items, customer_id, customer_name, customer_phone, payment_method, doc_no, post },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { branch_id, items, customer_id, customer_name, customer_phone, payment_method, doc_no } = req.body;
    if (!branch_id || !items) return res.status(400).json({ error: "branch_id e items son requeridos" });
    res.json(
      await SaleService.updateSale(
        +req.params.id,
        { branch_id, items, customer_id, customer_name, customer_phone, payment_method, doc_no },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function post(req, res, next) {
  try {
    res.json(await SaleService.postExistingSale(+req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}

export async function reopen(req, res, next) {
  try {
    res.json(await SaleService.reopenSale(+req.params.id, req.user, extractRequestMeta(req)));
  } catch (err) { next(err); }
}