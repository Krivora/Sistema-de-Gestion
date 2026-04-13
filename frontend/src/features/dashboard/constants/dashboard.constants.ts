import { formatLocalDate } from "@/lib/utils"
export const ACCENT = "#d97757"
export const BLUE = "#6a9bcc"
export const GREEN = "#788c5d"
export const PALETTE = [ACCENT, BLUE, GREEN, "#c4a882", "#9b7bb8"]

export const LOW_STOCK_THRESHOLD = 5
export const TOP_PRODUCTS_LIMIT = 7
export const DAY_IN_MS = 86_400_000

export const TODAY = formatLocalDate(new Date())
export const D7 = formatLocalDate(new Date(Date.now() - 7 * DAY_IN_MS))
export const D30 = formatLocalDate(new Date(Date.now() - 30 * DAY_IN_MS))

export const QUICK_ACTIONS = [
    { label: "Nueva venta", href: "/dashboard/sales/new", color: GREEN },
    { label: "Nueva compra", href: "/dashboard/purchases/new", color: BLUE },
    { label: "Ver reportes", href: "/dashboard/reports", color: ACCENT },
    { label: "Inventario", href: "/dashboard/branch-products", color: "#9b7bb8" },
    { label: "Clientes", href: "/dashboard/customers", color: "#c4a882" },
] as const

export const DATE_RANGES = {
    TODAY: "today",
    LAST_7_DAYS: "last7",
    LAST_30_DAYS: "last30",
} as const

export type DateRangeKey =
    typeof DATE_RANGES[keyof typeof DATE_RANGES]

export const DATE_RANGE_LABELS: Record<DateRangeKey, string> = {
    today: "Hoy",
    last7: "Últimos 7 días",
    last30: "Últimos 30 días",
}

export function getDateRange(range: DateRangeKey) {
    const now = new Date()

    switch (range) {
        case "today":
            return {
                startDate: formatLocalDate(now),
                endDate: formatLocalDate(now),
            }
        case "last7":
            return {
                startDate: formatLocalDate(
                    new Date(now.getTime() - 7 * 86_400_000)
                ),
                endDate: formatLocalDate(now),
            }
        case "last30":
        default:
            return {
                startDate: formatLocalDate(
                    new Date(now.getTime() - 30 * 86_400_000)
                ),
                endDate: formatLocalDate(now),
            }
    }
}
// Agrega en dashboard.constants.ts
export const RANGE_LABELS_VERBOSE: Record<DateRangeKey, {
    sales: string        // para SalesAreaChart
    period: string       // para FinancialSummary y KpiCards
    comparison: string   // para SalesVsPurchases
    badge: string        // para period-badge
}> = {
    today: {
        sales: "Ventas — hoy",
        period: "hoy",
        comparison: "últimas 24h",
        badge: "Hoy",
    },
    last7: {
        sales: "Ventas — últimos 7 días",
        period: "7 días",
        comparison: "últimos 7 días",
        badge: "7 días",
    },
    last30: {
        sales: "Ventas — últimos 30 días",
        period: "30 días",
        comparison: "últimos 30 días",
        badge: "30 días",
    },
}