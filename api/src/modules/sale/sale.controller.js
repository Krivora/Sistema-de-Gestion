import * as SaleService from "./sale.service.js";
import { extractRequestMeta } from "../../core/utils/audit.js";

export async function list(req, res, next) {
  try {
    const { status, branch_id, date_from, date_to, q, page, page_size } = req.query;
    res.json(await SaleService.listSales(req.user.client_id, {
      status, branch_id, date_from, date_to, q, page, page_size,
    }));
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
    const { branch_id, items, packages, customer_id, customer_name, customer_phone, payment_method, payment_type, doc_no, post = false } = req.body;
    if (!branch_id || (!items && !packages))
      return res.status(400).json({ error: "branch_id y al menos items o packages son requeridos" });
    res.status(201).json(
      await SaleService.createSale(
        { branch_id, items, packages, customer_id, customer_name, customer_phone, payment_method, payment_type, doc_no, post },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function update(req, res, next) {
  try {
    const { branch_id, items, packages, customer_id, customer_name, customer_phone, payment_method, doc_no } = req.body;
    if (!branch_id || (!items && !packages))
      return res.status(400).json({ error: "branch_id y al menos items o packages son requeridos" });
    res.json(
      await SaleService.updateSale(
        +req.params.id,
        { branch_id, items, packages, customer_id, customer_name, customer_phone, payment_method, doc_no },
        req.user,
        extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function receivables(req, res, next) {
  try {
    res.json(await SaleService.listReceivables(req.user.client_id, { branch_id: req.query.branch_id }));
  } catch (err) { next(err); }
}

export async function cancel(req, res, next) {
  try {
    res.json(await SaleService.cancelSale(
      +req.params.id, { reason: req.body?.reason }, req.user, extractRequestMeta(req)
    ));
  } catch (err) { next(err); }
}

export async function returnableItems(req, res, next) {
  try {
    res.json(await SaleService.getReturnableItems(+req.params.id, req.user.client_id));
  } catch (err) { next(err); }
}

export async function createReturn(req, res, next) {
  try {
    const { items, reason } = req.body;
    res.status(201).json(await SaleService.registerReturn(
      +req.params.id, { items, reason }, req.user, extractRequestMeta(req)
    ));
  } catch (err) { next(err); }
}

export async function listPayments(req, res, next) {
  try {
    res.json(await SaleService.listSalePayments(+req.params.id, req.user.client_id));
  } catch (err) { next(err); }
}

export async function addPayment(req, res, next) {
  try {
    const { amount, method, note } = req.body;
    res.status(201).json(
      await SaleService.registerSalePayment(
        +req.params.id, { amount, method, note }, req.user, extractRequestMeta(req)
      )
    );
  } catch (err) { next(err); }
}

export async function removePayment(req, res, next) {
  try {
    res.json(
      await SaleService.removeSalePayment(
        +req.params.paymentId, +req.params.id, req.user, extractRequestMeta(req)
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