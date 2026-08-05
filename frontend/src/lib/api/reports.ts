import { apiClient } from "./client"

export interface StockReport {
    branch_name: string
    product_id: number
    product_name: string
    sku: string
    category_name: string
    price: number
    stock: number
}

export interface SalesReport {
    date: string
    sales_count: number
    total_sales: number
}

export interface PurchasesReport {
    date: string
    purchase_count: number
    total_spent: number
}

export interface TopProduct {
    product_name: string
    total_qty: number
    total_sales: number
}

export interface DashboardReport {
    total_sales: number
    total_purchases: number
    total_revenue: number
    total_expense: number
}

/** Una fila por cliente del sistema. Solo superadmin. */
export interface SuperadminClientRow {
    id: number
    code: string
    name: string
    business_name: string | null
    logo_url: string | null
    is_active: boolean
    created_at: string
    max_users: number
    max_branches: number
    users_count: number
    branches_count: number
    /** Ventas publicadas dentro del periodo consultado */
    sales_count: number
    revenue: number
    /** Última venta publicada, de toda la historia (null si nunca vendió) */
    last_sale_at: string | null
    last_activity_at: string | null

    // ── Cobranza: ciclo mensual contado desde la fecha de alta ──
    /** Cuántos cortes ya vencieron. 0 = cliente de menos de un mes */
    cycles_due: number
    /** El corte vencido más reciente. null si todavía no cumple un mes */
    current_due: string | null
    /** El siguiente corte por venir */
    next_due: string
    paid_cycles: number
    pending_cycles: number
    /** El corte vencido más antiguo sin pagar — el que se salda primero */
    oldest_unpaid_due: string | null
    current_due_paid: boolean
    /** Último monto cobrado — la referencia para estimar lo pendiente */
    last_payment_amount: number | null
    last_payment_at: string | null
    collected_month: number

    /** true = lo apagó el sistema por falta de pago, no el superadmin a mano */
    suspended_for_payment: boolean
    /** Prórroga vigente hasta esta fecha (YYYY-MM-DD) */
    grace_until: string | null
    has_grace: boolean
}

export interface SuperadminOverview {
    totals: {
        clients: number
        active_clients: number
        users: number
        branches: number
        sales_count: number
        revenue: number
        /** Cobrado en el mes calendario en curso. Exacto. */
        collected_month: number
        pending_cycles: number
        pending_clients: number
        /** Estimado: cortes pendientes × último pago de cada cliente */
        pending_amount: number
        /** Clientes con adeudo pero sin historial de pago — no suman al estimado */
        pending_unknown: number
    }
    clients: SuperadminClientRow[]
}

export interface ClientPayment {
    id: number
    client_id: number
    due_date: string
    amount: number | null
    paid_at: string
    note: string | null
    registered_by?: string | null
}

export const reportsApi = {
    stock: (params?: { branchId?: number; categoryId?: number }) =>
        apiClient.get<StockReport[]>("/reports/stock", { params }).then((r) => r.data),
    sales: (startDate: string, endDate: string) =>
        apiClient.get<SalesReport[]>("/reports/sales", { params: { startDate, endDate } }).then((r) => r.data),
    purchases: (startDate: string, endDate: string) =>
        apiClient.get<PurchasesReport[]>("/reports/purchases", { params: { startDate, endDate } }).then((r) => r.data),
    topProducts: (limit = 10) =>
        apiClient.get<TopProduct[]>("/reports/top-products", { params: { limit } }).then((r) => r.data),
    dashboard: (startDate: string, endDate: string) =>
        apiClient.get<DashboardReport>("/reports/dashboard", { params: { startDate, endDate } }).then((r) => r.data),
    superadmin: (startDate: string, endDate: string) =>
        apiClient.get<SuperadminOverview>("/reports/superadmin", { params: { startDate, endDate } }).then((r) => r.data),

    clientPayments: (clientId: number) =>
        apiClient.get<ClientPayment[]>(`/reports/clients/${clientId}/payments`).then((r) => r.data),
    registerPayment: (clientId: number, data: { due_date: string; amount?: number | null; note?: string }) =>
        apiClient.post<ClientPayment>(`/reports/clients/${clientId}/payments`, data).then((r) => r.data),
    deletePayment: (clientId: number, paymentId: number) =>
        apiClient.delete(`/reports/clients/${clientId}/payments/${paymentId}`).then((r) => r.data),
    grantGrace: (clientId: number, grace_until: string) =>
        apiClient.post(`/reports/clients/${clientId}/grace`, { grace_until }).then((r) => r.data),
    revokeGrace: (clientId: number) =>
        apiClient.delete<{ suspended: boolean }>(`/reports/clients/${clientId}/grace`).then((r) => r.data),
}