import * as ClientRepo from "../../modules/client/client.repository.js";

/**
 * Cliente suspendido por falta de pago: puede iniciar sesión y ver el aviso de
 * cobro, pero no toca ningún dato hasta que se registre el pago o se le dé una
 * prórroga.
 *
 * Va del lado del servidor a propósito. Bloquear solo en la interfaz no serviría
 * de nada: el token que se entrega al iniciar sesión sirve para llamar el API
 * directamente.
 *
 * Responde 402 (Payment Required) en vez de 403 para que el frontend distinga
 * "te falta pagar" de "no tienes permiso", que se resuelven de formas distintas.
 */
export async function blockSuspendedClient(req, res, next) {
  try {
    // El superadmin no pertenece a ningún cliente y nunca se bloquea
    if (!req.user?.client_id || req.user.role_name === "superadmin") return next();

    const status = await ClientRepo.findBillingStatus(req.user.client_id);
    if (!status || status.is_active) return next();

    return res.status(402).json({
      error: status.suspended_for_payment
        ? "Cuenta suspendida por falta de pago. Realiza el pago para continuar."
        : "La cuenta de tu empresa está desactivada. Contacta a soporte.",
      code: "CLIENT_SUSPENDED",
      billing: {
        for_nonpayment: status.suspended_for_payment,
        pending_cycles: status.pending_cycles,
        oldest_unpaid_due: status.oldest_unpaid_due,
      },
    });
  } catch (err) {
    next(err);
  }
}
