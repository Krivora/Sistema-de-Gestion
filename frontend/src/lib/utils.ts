import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind de forma inteligente.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea valores monetarios.
 */
export function formatCurrency(amount: number, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Convierte un valor a número de forma segura.
 * Útil para datos provenientes de PostgreSQL (numeric).
 */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value)
  return 0
}

/**
 * Normaliza cualquier valor de fecha a un objeto Date válido.
 */
export function parseDate(value: string | Date): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // Si viene en formato YYYY-MM-DD, se añade una hora segura
  const normalized = value.includes("T")
    ? value
    : `${value}T12:00:00`

  const date = new Date(normalized)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Formatea una fecha en formato largo (ej. 13 abr 2026).
 */
export function formatDate(
  value: string | Date,
  locale = "es-MX"
): string {
  const date = parseDate(value)
  if (!date) return "—"

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date)
}

/**
 * Formatea una fecha corta para gráficos (ej. 13 abr).
 */
export function formatChartDate(
  value: string | Date,
  locale = "es-MX"
): string {
  const date = parseDate(value)
  if (!date) return ""

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date)
}

/**
 * Devuelve la fecha en formato YYYY-MM-DD en la zona horaria local.
 */
export function formatLocalDate(date: Date): string {
  return date.toLocaleDateString("en-CA")
}