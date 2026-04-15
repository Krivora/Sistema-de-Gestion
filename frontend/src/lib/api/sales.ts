import { apiClient } from "./client"

export interface SaleItem {
    id: number
    qty: number
    unit_price: number
    product_name: string
    sku: string
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
    customer_phone: string | null
    branch_name: string
    branch_code: string
    user_name: string
    items?: SaleItem[]
}

export interface SaleItemDto {
    product_id: number
    qty: number
    unit_price: number
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
    items: SaleItemDto[]
    post?: boolean          // false = open, true = posted
}

export const salesApi = {
    list: (params?: { status?: string; branch_id?: number; date_from?: string; date_to?: string }) =>
        apiClient.get<Sale[]>("/sales", { params }).then((r) => r.data),
    get: (id: number) => apiClient.get<Sale>(`/sales/${id}`).then((r) => r.data),
    create: (data: CreateSaleDto) => apiClient.post<Sale>("/sales", data).then((r) => r.data),
    post: (id: number) => apiClient.patch<Sale>(`/sales/${id}/post`).then((r) => r.data),
    reopen: (id: number) => apiClient.patch<Sale>(`/sales/${id}/reopen`).then((r) => r.data),
}