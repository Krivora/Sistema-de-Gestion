/**
 * 🔖 Tipos de transacciones de inventario
 *  Basado en el ENUM "transaction_type" de la base de datos
 */

export const INVENTORY_TYPES = Object.freeze({
  PURCHASE: "PURCHASE",           // Entrada por compra
  SALE: "SALE",                   // Salida por venta
  ADJUSTMENT_IN: "ADJUSTMENT_IN", // Ajuste manual positivo
  ADJUSTMENT_OUT: "ADJUSTMENT_OUT", // Ajuste manual negativo
  TRANSFER_IN: "TRANSFER_IN",     // Entrada por transferencia
  TRANSFER_OUT: "TRANSFER_OUT",   // Salida por transferencia
});

/**
 * 🧭 Utilidades
 */
export const INVENTORY_DIRECTIONS = Object.freeze({
  IN: ["PURCHASE", "ADJUSTMENT_IN", "TRANSFER_IN"],
  OUT: ["SALE", "ADJUSTMENT_OUT", "TRANSFER_OUT"],
});

export const INVENTORY_DESCRIPTIONS = Object.freeze({
  PURCHASE: "Entrada por compra",
  SALE: "Salida por venta",
  ADJUSTMENT_IN: "Ajuste positivo",
  ADJUSTMENT_OUT: "Ajuste negativo",
  TRANSFER_IN: "Entrada por transferencia",
  TRANSFER_OUT: "Salida por transferencia",
});

/**
 * ✅ Función helper: detectar si un tipo de movimiento suma o resta stock
 */
export function isIncoming(type) {
  return INVENTORY_DIRECTIONS.IN.includes(type);
}

export function isOutgoing(type) {
  return INVENTORY_DIRECTIONS.OUT.includes(type);
}
