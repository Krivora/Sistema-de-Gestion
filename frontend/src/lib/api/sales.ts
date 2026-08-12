import { apiClient } from "./client"

export interface SaleItem {
    id: number
    product_id: number
    qty: number
    /** En los renglones de un paquete es la parte prorrateada del precio fijo */
    unit_price: number
    product_name: string
    sku: string
    /** Apunta al paquete del que salió este producto; null si se vendió suelto */
    sale_package_id: number | null
}

/** Un paquete vendido. Sus productos viven en `SaleItem` apuntando aquí. */
export interface SalePackage {
    id: number
    /** null si el paquete se eliminó del catálogo después de la venta */
    package_id: number | null
    name: string
    qty: number
    /** Precio de un paquete */
    unit_price: number
    /** qty × unit_price */
    total: number
    package_code: string | null
    package_kind: "fixed" | "flexible" | null
}

export interface Sale {
    id: number
    doc_no: string
    status: "open" | "posted" | "cancelled"
    payment_method: string
    subtotal: number
    total: number
    posted_at: string | null
    created_at: string
    branch_id: number
    customer_id: number | null
    customer_name: string | null
    customer_name_full?: string | null
    customer_phone: string | null
    branch_name: string
    branch_code: string
    user_name: string
    items?: SaleItem[]
    packages?: SalePackage[]

    // ── Abonos ──
    /** 'contado' publica de inmediato; 'credito' exige saldo cero */
    payment_type: "contado" | "credito"
    /** Suma de abonos registrados */
    paid_amount: number
    /** total - paid_amount. Debe llegar a 0 para publicar una venta a crédito */
    balance: number
    /** En crédito el inventario sale al registrar la venta, no al publicarla */
    inventory_applied?: boolean
}

export interface SaleLineGroup {
    pkg: SalePackage
    items: SaleItem[]
}

/**
 * Separa los renglones de una venta: los que salieron de un paquete, agrupados
 * bajo él, y los que se vendieron sueltos. En el detalle y el ticket el paquete
 * se cobra completo, así que sus productos se listan sin precio propio: el que
 * traen es la parte prorrateada, y mostrarla confunde al cliente.
 */
export function groupSaleLines(sale: Sale): { packages: SaleLineGroup[]; loose: SaleItem[] } {
    const items = sale.items ?? []
    const packages = (sale.packages ?? []).map((pkg) => ({
        pkg,
        items: items.filter((i) => i.sale_package_id === pkg.id),
    }))

    const grouped = new Set(packages.flatMap((g) => g.items.map((i) => i.id)))
    return { packages, loose: items.filter((i) => !grouped.has(i.id)) }
}

export interface Paged<T> {
    data: T[]
    total: number
    page: number
    page_size: number
}

export interface SaleListParams {
    status?: string
    branch_id?: number | string
    date_from?: string
    date_to?: string
    q?: string
    page?: number
    page_size?: number
}

export interface ReturnableItem {
    id: number
    product_id: number
    product_name: string
    sku: string
    qty: number
    unit_price: number
    returned_qty: number
    returnable_qty: number
    /** Nombre del paquete del que salió, si no se vendió suelto */
    package_name: string | null
    sale_package_id: number | null
}

export interface SaleReturn {
    id: number
    sale_id: number
    total: number
    /** Parte aplicada a lo que el cliente debía */
    credited: number
    /** Parte que se le regresa en efectivo */
    refunded: number
    reason: string | null
    created_at: string
    registered_by?: string | null
    items: { product_name: string; sku: string; qty: number; unit_price: number }[]
}

export interface ReceivableSale {
    id: number
    doc_no: string
    created_at: string
    total: number
    balance: number
    paid_amount: number
    branch_name: string
    last_payment_at: string | null
    days_since: number
}

export interface ReceivablesReport {
    totals: { balance: number; customers: number; sales: number; overdue_30: number }
    customers: {
        customer_id: number | null
        customer_name: string
        customer_phone: string | null
        balance: number
        sales_count: number
        oldest_days: number
        sales: ReceivableSale[]
    }[]
}

export interface SalePayment {
    id: number
    sale_id: number
    amount: number
    method: string
    note: string | null
    paid_at: string
    registered_by?: string | null
}

export interface SaleItemDto {
    product_id: number
    qty: number
    unit_price: number
}

export interface SalePackageDto {
    package_id: number
    /** Cuántos paquetes iguales */
    qty: number
    /**
     * Solo en paquetes armables. En los predefinidos el contenido y el precio
     * los pone el catálogo en el servidor, nunca el navegador.
     */
    items?: { product_id: number; qty: number }[]
}


export const PAYMENT_METHODS = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TARJETA", label: "Tarjeta" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "OTRO", label: "Otro" },
]

export interface CreateSaleDto {
    branch_id: number | ""
    customer_id?: number | null
    customer_name?: string
    customer_phone?: string
    payment_method?: string
    doc_no?: string
    payment_type?: "contado" | "credito"
    items: SaleItemDto[]
    packages?: SalePackageDto[]
    post?: boolean          // false = open, true = posted
}

export type UpdateSaleDto = Omit<CreateSaleDto, "post">

export const salesApi = {
    /** Paginado en el servidor: la búsqueda y los filtros también viajan al API */
    list: (params?: SaleListParams) =>
        apiClient.get<Paged<Sale>>("/sales", { params }).then((r) => r.data),
    receivables: (params?: { branch_id?: number | string }) =>
        apiClient.get<ReceivablesReport>("/sales/receivables", { params }).then((r) => r.data),
    get: (id: number) => apiClient.get<Sale>(`/sales/${id}`).then((r) => r.data),
    create: (data: CreateSaleDto) => apiClient.post<Sale>("/sales", data).then((r) => r.data),
    update: (id: number, data: UpdateSaleDto) => apiClient.put<Sale>(`/sales/${id}`, data).then((r) => r.data),
    post: (id: number) => apiClient.patch<Sale>(`/sales/${id}/post`).then((r) => r.data),
    reopen: (id: number) => apiClient.patch<Sale>(`/sales/${id}/reopen`).then((r) => r.data),

    payments: (saleId: number) =>
        apiClient.get<{ sale: Sale; payments: SalePayment[] }>(`/sales/${saleId}/payments`).then((r) => r.data),
    addPayment: (saleId: number, data: { amount: number; method?: string; note?: string }) =>
        apiClient.post<{ payment: SalePayment; sale: Sale }>(`/sales/${saleId}/payments`, data).then((r) => r.data),
    deletePayment: (saleId: number, paymentId: number) =>
        apiClient.delete<{ sale: Sale }>(`/sales/${saleId}/payments/${paymentId}`).then((r) => r.data),

    cancel: (id: number, reason?: string) =>
        apiClient.patch<Sale & { refund_due: number }>(`/sales/${id}/cancel`, { reason }).then((r) => r.data),
    returnable: (id: number) =>
        apiClient.get<{ sale: Sale; items: ReturnableItem[]; returns: SaleReturn[] }>(`/sales/${id}/returns`)
            .then((r) => r.data),
    createReturn: (id: number, data: { items: { sale_item_id: number; qty: number }[]; reason?: string }) =>
        apiClient.post<{ return: SaleReturn; sale: Sale }>(`/sales/${id}/returns`, data).then((r) => r.data),
}