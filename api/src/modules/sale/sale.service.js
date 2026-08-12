import pool from "../../config/db.js";
import * as SaleRepo from "./sale.repository.js";
import * as InventoryRepo from "../inventory/inventory.repository.js";
import * as PackageRepo from "../package/package.repository.js";
import { logAction } from "../../core/utils/audit.js";

const bad = (msg, status = 400) => Object.assign(new Error(msg), { status });

const round2 = (n) => Math.round(n * 100) / 100;
const round4 = (n) => Math.round(n * 10000) / 10000;

export async function listSales(clientId, filters) {
  if (!clientId) throw Object.assign(new Error("client_id requerido"), { status: 400 });
  return SaleRepo.findAll(clientId, filters);
}

export async function getSaleById(id, clientId) {
  const header = await SaleRepo.findById(id, clientId);
  if (!header) return null;
  const [items, packages] = await Promise.all([
    SaleRepo.findItems(id, clientId),
    SaleRepo.findSalePackages(id, clientId),
  ]);
  return { ...header, items, packages };
}

function validateSalePayload({ branch_id, items, packages }) {
  if (!branch_id) throw Object.assign(new Error("branch_id requerido"), { status: 400 });

  const hasItems    = Array.isArray(items)    && items.length;
  const hasPackages = Array.isArray(packages) && packages.length;
  if (!hasItems && !hasPackages)
    throw bad("Se requiere al menos un producto o paquete");

  for (const item of items ?? []) {
    if (!item.product_id) throw Object.assign(new Error("product_id requerido en cada item"), { status: 400 });
    const qty   = Number(item.qty);
    const price = Number(item.unit_price);
    if (!Number.isFinite(qty)   || qty   <= 0) throw Object.assign(new Error(`Cantidad inválida en producto ${item.product_id}`), { status: 400 });
    if (!Number.isFinite(price) || price <  0) throw Object.assign(new Error(`Precio inválido en producto ${item.product_id}`),   { status: 400 });
  }
}

/* ── Paquetes ─────────────────────────────────────────────────── */

/**
 * Reparte el precio fijo del paquete entre sus productos, proporcional a lo que
 * cada uno vale por separado (y por piezas si ninguno tiene precio de lista).
 *
 * Se prorratea en vez de guardar el paquete como un renglón aparte para que
 * cada producto siga siendo una venta normal: el inventario, las devoluciones
 * parciales y el total de la venta funcionan sin tratar al paquete como caso
 * especial. El último renglón absorbe el redondeo, así la suma da exactamente
 * el precio del paquete.
 */
function proratePackagePrice(total, lines) {
  const weights = lines.map((l) => (l.weight > 0 ? l.weight : 0));
  const totalWeight = weights.reduce((a, w) => a + w, 0);

  const basis = totalWeight > 0 ? weights : lines.map((l) => l.qty);
  const totalBasis = basis.reduce((a, b) => a + b, 0);

  let assigned = 0;
  return lines.map((line, i) => {
    const lineTotal = i === lines.length - 1
      ? round2(total - assigned)
      : round2((total * basis[i]) / totalBasis);
    assigned = round2(assigned + lineTotal);
    return { product_id: line.product_id, qty: line.qty, unit_price: round4(lineTotal / line.qty) };
  });
}

/**
 * Qué lleva un paquete armable. Las piezas las elige el vendedor, pero el
 * catálogo manda: ni más ni menos piezas de las pactadas, y solo productos que
 * el paquete acepta. Validarlo aquí y no en el navegador evita que alguien
 * arme un paquete de $200 con lo más caro de la bodega.
 */
async function resolveFlexibleItems(db, pkg, rawItems) {
  if (!Array.isArray(rawItems) || !rawItems.length)
    throw bad(`Selecciona los productos del paquete "${pkg.name}"`);

  const allowed = await PackageRepo.findAllowedProductIds(db, pkg);
  const merged = new Map();

  for (const raw of rawItems) {
    const product_id = Number(raw.product_id);
    const qty = Number(raw.qty ?? 1);

    if (!Number.isInteger(product_id)) throw bad(`Producto inválido en el paquete "${pkg.name}"`);
    if (!Number.isFinite(qty) || qty <= 0)
      throw bad(`Cantidad inválida en el paquete "${pkg.name}"`);
    if (allowed && !allowed.has(product_id))
      throw bad(`Un producto seleccionado no pertenece al paquete "${pkg.name}"`);

    merged.set(product_id, (merged.get(product_id) ?? 0) + qty);
  }

  const picked = [...merged.values()].reduce((a, q) => a + q, 0);
  const expected = Number(pkg.item_count);
  if (Math.abs(picked - expected) > 0.0001)
    throw bad(`El paquete "${pkg.name}" lleva ${expected} pieza(s) y seleccionaste ${picked}`);

  return [...merged.entries()].map(([product_id, qty]) => ({ product_id, qty }));
}

/** Convierte los paquetes pedidos en renglones de venta listos para insertar. */
async function resolvePackages(db, { packages, branch_id, client_id }) {
  if (!Array.isArray(packages) || !packages.length) return [];

  const resolved = [];

  for (const raw of packages) {
    const pkg = await PackageRepo.findById(Number(raw.package_id), client_id, db);
    if (!pkg) throw bad("Uno de los paquetes ya no existe", 404);
    if (pkg.status !== "active") throw bad(`El paquete "${pkg.name}" está inactivo`);

    const qty = Number(raw.qty ?? 1);
    if (!Number.isFinite(qty) || qty <= 0)
      throw bad(`Cantidad inválida para el paquete "${pkg.name}"`);

    const contents = pkg.kind === "fixed"
      ? pkg.items.map((i) => ({ product_id: i.product_id, qty: Number(i.qty) }))
      : await resolveFlexibleItems(db, pkg, raw.items);

    if (!contents.length) throw bad(`El paquete "${pkg.name}" no tiene productos`);

    const productIds = contents.map((c) => c.product_id);
    const prices = await SaleRepo.findBranchPrices(db, branch_id, productIds, client_id);

    const lines = proratePackagePrice(
      round2(pkg.price * qty),
      contents.map((c) => {
        const lineQty = round4(c.qty * qty);
        return { product_id: c.product_id, qty: lineQty, weight: (prices.get(c.product_id) ?? 0) * lineQty };
      })
    );

    resolved.push({ package_id: pkg.id, name: pkg.name, qty, unit_price: pkg.price, lines });
  }

  return resolved;
}

/**
 * Renglones a insertar: los productos sueltos más los que aportan los paquetes.
 * Crea de paso la cabecera de cada paquete vendido.
 */
async function buildSaleLines(trx, { saleId, items, resolvedPackages, client_id }) {
  const lines = items.map((item) => ({
    product_id: item.product_id,
    qty: Number(item.qty),
    unit_price: Number(item.unit_price),
    sale_package_id: null,
  }));

  for (const group of resolvedPackages) {
    const sp = await SaleRepo.createSalePackage(trx, {
      sale_id: saleId, package_id: group.package_id, client_id,
      name: group.name, qty: group.qty, unit_price: group.unit_price,
    });
    lines.push(...group.lines.map((l) => ({ ...l, sale_package_id: sp.id })));
  }

  return lines;
}

export async function createSale(payload, user, meta = {}) {
  const { branch_id, customer_id, customer_name, customer_phone, payment_method, doc_no, post = false } = payload;
  const items    = Array.isArray(payload.items)    ? payload.items    : [];
  const packages = Array.isArray(payload.packages) ? payload.packages : [];
  const payment_type = payload.payment_type === "credito" ? "credito" : "contado";
  const { client_id, id: user_id } = user;

  validateSalePayload({ branch_id, items, packages });

  // Venta a abonos = fiado: el cliente se lleva la mercancía hoy y paga después,
  // así que el inventario sale al registrarla aunque la venta siga abierta.
  // Publicarla más tarde solo la marca como saldada, sin volver a descontar.
  const applyInventory = post || payment_type === "credito";

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const resolvedPackages = await resolvePackages(trx, { packages, branch_id, client_id });

    const sale = await SaleRepo.createHeader(trx, {
      doc_no, branch_id, client_id, user_id,
      customer_id, customer_name, customer_phone, payment_method, payment_type,
    });

    const lines = await buildSaleLines(trx, {
      saleId: sale.id, items, resolvedPackages, client_id,
    });

    for (const line of lines) {
      await SaleRepo.addItem(trx, { sale_id: sale.id, client_id, ...line });

      if (applyInventory) {
        await InventoryRepo.createAndApply(trx, {
          branch_id, product_id: line.product_id,
          qty: line.qty, type: "SALE", unit_cost: line.unit_price,
          note: `Venta ${sale.doc_no}`,
          ref_type: "sales", ref_id: sale.id,
        }, client_id, user_id);
      }
    }

    if (applyInventory) await SaleRepo.setInventoryApplied(trx, sale.id, client_id, true);

    await SaleRepo.updateTotals(trx, sale.id, client_id);

    const final = post
      ? await SaleRepo.setPosted(trx, sale.id, client_id)
      : sale;

    if (!final) throw new Error("Error al procesar la venta");
    await trx.query("COMMIT");

    const created = await getSaleById(final.id, client_id);

    const detail = [
      items.length ? `${items.length} producto(s)` : null,
      resolvedPackages.length ? `${resolvedPackages.length} paquete(s)` : null,
    ].filter(Boolean).join(" y ");

    await logAction({
      ...meta, client_id, user_id,
      action: post ? "CREATE_SALE" : "CREATE_SALE_OPEN",
      description: `Venta ${final.doc_no} creada (${post ? "posted" : "open"}) con ${detail}`,
      ref_table: "sales", ref_id: final.id,
      new_data: created,
    });

    return created;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

export async function updateSale(id, payload, user, meta = {}) {
  const { branch_id, customer_id, customer_name, customer_phone, payment_method, doc_no } = payload;
  const items    = Array.isArray(payload.items)    ? payload.items    : [];
  const packages = Array.isArray(payload.packages) ? payload.packages : [];
  const { client_id, id: user_id } = user;

  const existing = await getSaleById(id, client_id);
  if (!existing) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (existing.status !== "open")
    throw Object.assign(new Error("Solo las ventas abiertas pueden editarse"), { status: 400 });

  validateSalePayload({ branch_id, items, packages });

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const header = await SaleRepo.updateHeader(trx, id, client_id, {
      branch_id, customer_id, customer_name, customer_phone, payment_method, doc_no,
    });
    if (!header) throw Object.assign(new Error("Solo las ventas abiertas pueden editarse"), { status: 400 });

    // Si el inventario de esta venta ya salió (caso típico: venta a abonos),
    // hay que devolver los renglones viejos antes de descontar los nuevos, o el
    // stock queda desfasado por la diferencia.
    if (existing.inventory_applied) {
      for (const item of existing.items) {
        await InventoryRepo.createAndApply(trx, {
          branch_id: existing.branch_id, product_id: item.product_id,
          qty: item.qty, type: "ADJUSTMENT_IN", unit_cost: item.unit_price,
          note: `Ajuste por edición de venta ${existing.doc_no}`,
          ref_type: "sales", ref_id: existing.id,
        }, client_id, user_id);
      }
    }

    const resolvedPackages = await resolvePackages(trx, { packages, branch_id, client_id });

    // Los renglones de un paquete cuelgan de sale_packages con ON DELETE
    // CASCADE: borrar primero los items y luego los paquetes deja la venta
    // limpia para volver a armarla.
    await SaleRepo.deleteItems(trx, id, client_id);
    await SaleRepo.deleteSalePackages(trx, id, client_id);

    const lines = await buildSaleLines(trx, {
      saleId: id, items, resolvedPackages, client_id,
    });

    for (const line of lines) {
      await SaleRepo.addItem(trx, { sale_id: id, client_id, ...line });

      if (existing.inventory_applied) {
        await InventoryRepo.createAndApply(trx, {
          branch_id, product_id: line.product_id,
          qty: line.qty, type: "SALE", unit_cost: line.unit_price,
          note: `Venta ${existing.doc_no} (editada)`,
          ref_type: "sales", ref_id: id,
        }, client_id, user_id);
      }
    }

    await SaleRepo.updateTotals(trx, id, client_id);
    await trx.query("COMMIT");

    const updated = await getSaleById(id, client_id);

    const detail = [
      items.length ? `${items.length} producto(s)` : null,
      resolvedPackages.length ? `${resolvedPackages.length} paquete(s)` : null,
    ].filter(Boolean).join(" y ");

    await logAction({
      ...meta, client_id, user_id,
      action: "UPDATE_SALE",
      description: `Venta ${updated.doc_no} editada (${detail})`,
      ref_table: "sales", ref_id: updated.id,
      old_data: existing, new_data: updated,
    });

    return updated;
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

/**
 * Cuentas por cobrar agrupadas por cliente. Se agrupa en el servidor para que
 * los totales por cliente sean correctos aunque la lista se pagine después.
 */
export async function listReceivables(clientId, filters = {}) {
  const sales = await SaleRepo.findReceivables(clientId, filters);

  const map = new Map();
  for (const s of sales) {
    // Sin customer_id (venta a nombre suelto) se agrupa por nombre
    const key = s.customer_id ?? `n:${(s.customer_name ?? "").toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        customer_id: s.customer_id,
        customer_name: s.customer_name || "Sin cliente",
        customer_phone: s.customer_phone,
        balance: 0, sales_count: 0, oldest_days: 0, sales: [],
      });
    }
    const g = map.get(key);
    g.balance += s.balance;
    g.sales_count += 1;
    g.oldest_days = Math.max(g.oldest_days, s.days_since);
    g.sales.push(s);
  }

  const customers = [...map.values()]
    .map((g) => ({ ...g, balance: Number(g.balance.toFixed(2)) }))
    .sort((a, b) => b.oldest_days - a.oldest_days || b.balance - a.balance);

  const totals = customers.reduce(
    (acc, c) => ({
      balance: acc.balance + c.balance,
      customers: acc.customers + 1,
      sales: acc.sales + c.sales_count,
      overdue_30: acc.overdue_30 + (c.oldest_days >= 30 ? c.balance : 0),
    }),
    { balance: 0, customers: 0, sales: 0, overdue_30: 0 }
  );
  totals.balance = Number(totals.balance.toFixed(2));
  totals.overdue_30 = Number(totals.overdue_30.toFixed(2));

  return { totals, customers };
}

/* ── Cancelación ──────────────────────────────────────────── */

/**
 * Anula una venta. Si su inventario ya había salido, lo regresa; si tenía
 * abonos, quedan registrados como saldo a favor del cliente y se reportan
 * para que en caja sepan cuánto devolver.
 */
export async function cancelSale(id, { reason }, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const existing = await getSaleById(id, client_id);
  if (!existing) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (existing.status === "cancelled")
    throw Object.assign(new Error("Esta venta ya está cancelada"), { status: 400 });
  if (existing.returned_total > 0)
    throw Object.assign(
      new Error("Esta venta tiene devoluciones registradas: no puede cancelarse completa"),
      { status: 400 }
    );

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    if (existing.inventory_applied) {
      for (const item of existing.items) {
        await InventoryRepo.createAndApply(trx, {
          branch_id: existing.branch_id, product_id: item.product_id,
          qty: item.qty, type: "ADJUSTMENT_IN", unit_cost: item.unit_price,
          note: `Cancelación venta ${existing.doc_no}`,
          ref_type: "sales", ref_id: existing.id,
        }, client_id, user_id);
      }
      await SaleRepo.setInventoryApplied(trx, id, client_id, false);
    }

    const cancelled = await SaleRepo.setCancelled(trx, id, client_id, reason);
    if (!cancelled) throw new Error("Error al cancelar la venta");

    await trx.query("COMMIT");

    await logAction({
      ...meta, client_id, user_id,
      action: "CANCEL_SALE",
      description: `Venta ${existing.doc_no} cancelada`
        + (existing.paid_amount > 0 ? ` — devolver ${existing.paid_amount.toFixed(2)} al cliente` : "")
        + (reason ? ` (${reason})` : ""),
      ref_table: "sales", ref_id: id,
      old_data: existing, new_data: cancelled,
    });

    return {
      ...(await getSaleById(id, client_id)),
      /** Lo que ya había abonado y hay que regresarle en caja */
      refund_due: existing.paid_amount,
    };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

/* ── Devoluciones ─────────────────────────────────────────── */

export async function getReturnableItems(saleId, clientId) {
  const sale = await SaleRepo.findById(saleId, clientId);
  if (!sale) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  const items = await SaleRepo.findItemsWithReturned(saleId, clientId);
  const returns = await SaleRepo.findReturns(saleId, clientId);
  return { sale, items, returns };
}

/**
 * Devolución parcial. La mercancía entra al inventario y el importe se aplica
 * primero a lo que el cliente todavía debe; solo el excedente se le regresa en
 * efectivo, para no darle dinero a alguien que sigue debiendo.
 */
export async function registerReturn(saleId, { items, reason }, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const sale = await SaleRepo.findById(saleId, client_id);
  if (!sale) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (sale.status === "cancelled")
    throw Object.assign(new Error("No se puede devolver sobre una venta cancelada"), { status: 400 });
  if (!Array.isArray(items) || !items.length)
    throw Object.assign(new Error("Selecciona al menos un producto a devolver"), { status: 400 });

  const available = await SaleRepo.findItemsWithReturned(saleId, client_id);
  const byId = new Map(available.map((i) => [i.id, i]));

  const lines = [];
  for (const raw of items) {
    const line = byId.get(Number(raw.sale_item_id));
    if (!line)
      throw Object.assign(new Error("Un producto no pertenece a esta venta"), { status: 400 });

    const qty = Number(raw.qty);
    if (!Number.isFinite(qty) || qty <= 0)
      throw Object.assign(new Error(`Cantidad inválida para ${line.product_name}`), { status: 400 });
    if (qty > line.returnable_qty + 0.0001)
      throw Object.assign(
        new Error(`Solo quedan ${line.returnable_qty} piezas por devolver de ${line.product_name}`),
        { status: 400 }
      );

    lines.push({ line, qty });
  }

  const total = Number(
    lines.reduce((acc, l) => acc + l.qty * l.line.unit_price, 0).toFixed(2)
  );
  // Primero abona a la deuda; lo que sobra se le regresa en efectivo
  const credited = Number(Math.min(total, Math.max(sale.balance, 0)).toFixed(2));
  const refunded = Number((total - credited).toFixed(2));

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    const ret = await SaleRepo.createReturn(trx, {
      sale_id: saleId, client_id, branch_id: sale.branch_id,
      total, credited, refunded, reason, user_id,
    });

    for (const { line, qty } of lines) {
      await SaleRepo.addReturnItem(trx, {
        return_id: ret.id, sale_item_id: line.id, product_id: line.product_id,
        qty, unit_price: line.unit_price, client_id,
      });

      // La mercancía regresa al inventario solo si había salido
      if (sale.inventory_applied) {
        await InventoryRepo.createAndApply(trx, {
          branch_id: sale.branch_id, product_id: line.product_id,
          qty, type: "ADJUSTMENT_IN", unit_cost: line.unit_price,
          note: `Devolución venta ${sale.doc_no}`,
          ref_type: "sales", ref_id: saleId,
        }, client_id, user_id);
      }
    }

    await trx.query("COMMIT");

    const updated = await getSaleById(saleId, client_id);

    await logAction({
      ...meta, client_id, user_id,
      action: "REGISTER_SALE_RETURN",
      description: `Devolución de ${total.toFixed(2)} en venta ${sale.doc_no}`
        + ` (${credited.toFixed(2)} a cuenta, ${refunded.toFixed(2)} en efectivo)`,
      ref_table: "sale_returns", ref_id: ret.id,
      new_data: { ...ret, items: lines.map((l) => ({ product: l.line.product_name, qty: l.qty })) },
    });

    return { return: ret, sale: updated };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

/* ── Abonos ───────────────────────────────────────────────── */

export async function listSalePayments(saleId, clientId) {
  const sale = await SaleRepo.findById(saleId, clientId);
  if (!sale) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  const payments = await SaleRepo.findPayments(saleId, clientId);
  return { sale, payments };
}

export async function registerSalePayment(saleId, { amount, method, note }, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const sale = await SaleRepo.findById(saleId, client_id);
  if (!sale) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (sale.status === "cancelled")
    throw Object.assign(new Error("No se pueden registrar abonos en una venta cancelada"), { status: 400 });

  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0)
    throw Object.assign(new Error("El monto del abono debe ser mayor a cero"), { status: 400 });

  // Tolerancia de un centavo: los redondeos no deben impedir el último abono
  if (value > sale.balance + 0.009)
    throw Object.assign(
      new Error(`El abono excede el saldo pendiente de ${sale.balance.toFixed(2)}`),
      { status: 400 }
    );

  const payment = await SaleRepo.addPayment(pool, {
    sale_id: saleId, client_id, amount: value,
    method: method || "EFECTIVO", note, user_id,
  });

  const updated = await SaleRepo.findById(saleId, client_id);

  await logAction({
    ...meta, client_id, user_id,
    action: "REGISTER_SALE_PAYMENT",
    description: `Abono de ${value.toFixed(2)} en venta ${sale.doc_no}`
      + ` — saldo ${updated.balance.toFixed(2)}`,
    ref_table: "sale_payments", ref_id: payment.id,
    new_data: payment,
  });

  return { payment, sale: updated };
}

export async function removeSalePayment(paymentId, saleId, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const sale = await SaleRepo.findById(saleId, client_id);
  if (!sale) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (sale.status === "posted")
    throw Object.assign(
      new Error("La venta ya está publicada: reábrela antes de cancelar un abono"),
      { status: 400 }
    );

  const deleted = await SaleRepo.deletePayment(paymentId, saleId, client_id);
  if (!deleted) throw Object.assign(new Error("Abono no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id, user_id,
    action: "DELETE_SALE_PAYMENT",
    description: `Abono de ${deleted.amount.toFixed(2)} cancelado en venta ${sale.doc_no}`,
    ref_table: "sale_payments", ref_id: deleted.id,
    old_data: deleted,
  });

  return { deleted, sale: await SaleRepo.findById(saleId, client_id) };
}

export async function postExistingSale(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const existing = await getSaleById(id, client_id);
  if (!existing) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (existing.status !== "open") throw Object.assign(new Error("Solo ventas open pueden publicarse"), { status: 400 });

  // Una venta a abonos no se publica hasta quedar saldada. Las de contado
  // conservan el comportamiento de siempre.
  if (existing.payment_type === "credito" && existing.balance > 0.009) {
    throw Object.assign(
      new Error(`Faltan ${existing.balance.toFixed(2)} por abonar para poder publicar esta venta`),
      { status: 400 }
    );
  }

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    // En las de crédito el inventario ya salió al registrarlas
    if (!existing.inventory_applied) {
      for (const item of existing.items) {
        await InventoryRepo.createAndApply(trx, {
          branch_id: existing.branch_id, product_id: item.product_id,
          qty: item.qty, type: "SALE", unit_cost: item.unit_price,
          note: `Venta ${existing.doc_no}`,
          ref_type: "sales", ref_id: existing.id,
        }, client_id, user_id);
      }
      await SaleRepo.setInventoryApplied(trx, id, client_id, true);
    }

    const posted = await SaleRepo.setPosted(trx, id, client_id);
    if (!posted) throw new Error("Error al publicar la venta");
    await trx.query("COMMIT");

    await logAction({
      ...meta, client_id, user_id,
      action: "POST_SALE",
      description: `Venta ${posted.doc_no} publicada`,
      ref_table: "sales", ref_id: posted.id,
      new_data: posted,
    });

    return { ...posted, items: existing.items };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}

export async function reopenSale(id, user, meta = {}) {
  const { client_id, id: user_id } = user;

  const existing = await getSaleById(id, client_id);
  if (!existing) throw Object.assign(new Error("Venta no encontrada"), { status: 404 });
  if (existing.status !== "posted") throw Object.assign(new Error("Solo ventas posted pueden reabrirse"), { status: 400 });

  const trx = await pool.connect();
  try {
    await trx.query("BEGIN");

    // En una venta a abonos la mercancía ya está con el cliente: reabrirla
    // significa "vuelve a deber", no "devolvió el producto". Regresar el stock
    // aquí inflaría el inventario con cosas que no están en la bodega.
    if (existing.payment_type !== "credito") {
      for (const item of existing.items) {
        // ADJUSTMENT_IN y no "SALE_REVERT": ese valor no existe en el enum
        // transaction_type ni en IN_TYPES, así que reabrir siempre tronaba.
        await InventoryRepo.createAndApply(trx, {
          branch_id: existing.branch_id, product_id: item.product_id,
          qty: item.qty, type: "ADJUSTMENT_IN", unit_cost: item.unit_price,
          note: `Reversión venta ${existing.doc_no}`,
          ref_type: "sales", ref_id: existing.id,
        }, client_id, user_id);
      }
      await SaleRepo.setInventoryApplied(trx, id, client_id, false);
    }

    const reopened = await SaleRepo.setOpen(trx, id, client_id);
    if (!reopened) throw new Error("Error al reabrir la venta");
    await trx.query("COMMIT");

    await logAction({
      ...meta, client_id, user_id,
      action: "REOPEN_SALE",
      description: `Venta ${reopened.doc_no} reabierta`,
      ref_table: "sales", ref_id: reopened.id,
      new_data: reopened,
    });

    return { ...reopened, items: existing.items };
  } catch (err) {
    await trx.query("ROLLBACK");
    throw err;
  } finally {
    trx.release();
  }
}