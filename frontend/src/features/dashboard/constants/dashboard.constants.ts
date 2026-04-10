export const ACCENT = "#d97757"
export const BLUE = "#6a9bcc"
export const GREEN = "#788c5d"
export const PALETTE = [ACCENT, BLUE, GREEN, "#c4a882", "#9b7bb8"]

export const LOW_STOCK_THRESHOLD = 5
export const TOP_PRODUCTS_LIMIT = 7

const pad = (d: Date) => d.toISOString().split("T")[0]
export const TODAY = pad(new Date())
export const D7 = pad(new Date(Date.now() - 7 * 86_400_000))
export const D30 = pad(new Date(Date.now() - 30 * 86_400_000))

export const QUICK_ACTIONS = [
    { label: "Nueva venta", href: "/dashboard/sales/new", color: GREEN },
    { label: "Nueva compra", href: "/dashboard/purchases/new", color: BLUE },
    { label: "Ver reportes", href: "/dashboard/reports", color: ACCENT },
    { label: "Inventario", href: "/dashboard/branch-products", color: "#9b7bb8" },
    { label: "Clientes", href: "/dashboard/customers", color: "#c4a882" },
] as const