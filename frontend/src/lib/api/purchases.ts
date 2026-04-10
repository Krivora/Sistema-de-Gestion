import { apiClient } from "./client"

export interface PurchaseItem {
    id: number
    qty: number
    unit_cost: number
    product_name: string
    sku: string
}

export interface Purchase {
    id: number
    doc_no: string
    status: "draft" | "posted" | "cancelled"
    posted_at: string | null
    created_at: string
    branch_id: number
    supplier_id: number | null
    branch_name: string
    user_name: string
    items?: PurchaseItem[]
}

export interface PurchaseItemDto {
    product_id: number
    qty: number
    unit_cost: number
}

export interface CreatePurchaseDto {
    branch_id: number | ""
    supplier_id?: number | null
    doc_no?: string
    items: PurchaseItemDto[]
}

export const purchasesApi = {
    list: (params?: { status?: string; branch_id?: number; date_from?: string; date_to?: string }) =>
        apiClient.get<Purchase[]>("/purchases", { params }).then((r) => r.data),
    get: (id: number) => apiClient.get<Purchase>(`/purchases/${id}`).then((r) => r.data),
    create: (data: CreatePurchaseDto) => apiClient.post<Purchase>("/purchases", data).then((r) => r.data),
}