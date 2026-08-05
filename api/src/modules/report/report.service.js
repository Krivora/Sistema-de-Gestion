import * as ReportRepo from "./report.repository.js";
import { logAction } from "../../core/utils/audit.js";
import * as ClientRepo from "../client/client.repository.js";

export async function stock({ branchId, categoryId, clientId, roleName }) {
  return ReportRepo.getCurrentStockByBranch(branchId, categoryId, clientId, roleName);
}

export async function sales({ startDate, endDate, clientId, roleName }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });
  return ReportRepo.getSalesByPeriod({ startDate, endDate, clientId, roleName });
}

export async function purchases({ startDate, endDate, clientId, roleName }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });
  return ReportRepo.getPurchasesByPeriod({ startDate, endDate, clientId, roleName });
}

export async function topProducts({ limit, clientId, roleName }) {
  return ReportRepo.getTopSellingProducts(limit, clientId, roleName);
}

export async function superadminOverview({ startDate, endDate }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });

  // Se barre antes de consultar para que el tablero muestre el estado real:
  // sin tareas programadas, este es el otro momento en que el corte se aplica.
  await ClientRepo.suspendDelinquentClients();

  const clients = await ReportRepo.getSuperadminOverview({ startDate, endDate });

  // Los totales salen de las mismas filas: una sola consulta, sin discrepancias.
  //
  // Sobre `pending_amount`: al no haber cuota fija, lo pendiente se estima con
  // el último pago de cada cliente. Quien nunca ha pagado suma al conteo de
  // cortes pero no al monto — por eso se reporta `pending_unknown`, para que la
  // UI pueda decir que el estimado se queda corto en vez de fingir exactitud.
  const totals = clients.reduce((acc, c) => {
    const estimable = c.pending_cycles > 0 && c.last_payment_amount != null;
    return {
      clients:         acc.clients + 1,
      active_clients:  acc.active_clients + (c.is_active ? 1 : 0),
      users:           acc.users + c.users_count,
      branches:        acc.branches + c.branches_count,
      sales_count:     acc.sales_count + c.sales_count,
      revenue:         acc.revenue + c.revenue,
      collected_month: acc.collected_month + c.collected_month,
      pending_cycles:  acc.pending_cycles + c.pending_cycles,
      pending_clients: acc.pending_clients + (c.pending_cycles > 0 ? 1 : 0),
      pending_amount:  acc.pending_amount + (estimable ? c.pending_cycles * c.last_payment_amount : 0),
      pending_unknown: acc.pending_unknown + (c.pending_cycles > 0 && c.last_payment_amount == null ? 1 : 0),
    };
  }, {
    clients: 0, active_clients: 0, users: 0, branches: 0, sales_count: 0, revenue: 0,
    collected_month: 0, pending_cycles: 0, pending_clients: 0, pending_amount: 0, pending_unknown: 0,
  });

  return { totals, clients };
}

export async function listClientPayments(clientId) {
  return ReportRepo.findPaymentsByClient(clientId);
}

export async function registerClientPayment({ clientId, due_date, amount, note }, user, meta = {}) {
  if (!due_date) throw Object.assign(new Error("due_date es requerido"), { status: 400 });
  if (Number.isNaN(new Date(due_date).getTime()))
    throw Object.assign(new Error("due_date inválida"), { status: 400 });

  if (amount != null && amount !== "") {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 0)
      throw Object.assign(new Error("Monto inválido"), { status: 400 });
    amount = n;
  } else {
    amount = null;
  }

  const payment = await ReportRepo.createPayment({
    client_id: clientId, due_date, amount, note, user_id: user.id,
  });

  // Si con este pago quedó al corriente y estaba suspendido por el sistema,
  // se reactiva solo. A quien fue desactivado a mano no se le toca.
  const revived = await ClientRepo.reactivateIfSettled(clientId);

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "REGISTER_CLIENT_PAYMENT",
    description: `Pago registrado para el cliente ${clientId}, corte ${due_date}`
      + (revived ? " — cuenta reactivada" : ""),
    ref_table: "client_payments", ref_id: payment.id,
    new_data: payment,
  });

  return { ...payment, reactivated: !!revived };
}

export async function grantGrace({ clientId, grace_until }, user, meta = {}) {
  if (!grace_until) throw Object.assign(new Error("grace_until es requerido"), { status: 400 });

  const date = new Date(`${grace_until}T00:00:00`);
  if (Number.isNaN(date.getTime()))
    throw Object.assign(new Error("Fecha de prórroga inválida"), { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today)
    throw Object.assign(new Error("La prórroga no puede ser una fecha pasada"), { status: 400 });

  const client = await ClientRepo.setGrace(clientId, grace_until);
  if (!client) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "GRANT_CLIENT_GRACE",
    description: `Prórroga otorgada a ${client.name} hasta ${grace_until} (sin registrar pago)`,
    ref_table: "clients", ref_id: clientId,
    new_data: client,
  });

  return client;
}

export async function revokeGrace(clientId, user, meta = {}) {
  const client = await ClientRepo.clearGrace(clientId);
  if (!client) throw Object.assign(new Error("Cliente no encontrado"), { status: 404 });

  // Sin la prórroga de por medio, el corte vencido aplica de inmediato: se
  // ejecuta aquí para que el tablero no muestre un estado que ya no es cierto.
  const suspended = await ClientRepo.suspendDelinquentClients();
  const wasSuspended = suspended.some((c) => c.id === clientId);

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "REVOKE_CLIENT_GRACE",
    description: `Prórroga cancelada a ${client.name}`
      + (wasSuspended ? " — cuenta suspendida" : ""),
    ref_table: "clients", ref_id: clientId,
    new_data: { ...client, suspended: wasSuspended },
  });

  return { ...client, is_active: wasSuspended ? false : client.is_active, suspended: wasSuspended };
}

export async function removeClientPayment(id, clientId, user, meta = {}) {
  const deleted = await ReportRepo.deletePayment(id, clientId);
  if (!deleted) throw Object.assign(new Error("Pago no encontrado"), { status: 404 });

  await logAction({
    ...meta, client_id: user.client_id, user_id: user.id,
    action: "DELETE_CLIENT_PAYMENT",
    description: `Pago revertido para el cliente ${clientId}, corte ${deleted.due_date}`,
    ref_table: "client_payments", ref_id: deleted.id,
    old_data: deleted,
  });

  return deleted;
}

export async function dashboard({ startDate, endDate, clientId, roleName }) {
  if (!startDate || !endDate) throw Object.assign(new Error("startDate y endDate son requeridos"), { status: 400 });
  return ReportRepo.getDashboardSummary({ startDate, endDate, clientId, roleName });
}