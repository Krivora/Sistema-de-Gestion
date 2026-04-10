import { apiClient } from "./client"

export interface AdjustmentItem {
    id: number
    qty: number
    note?: string
    product_name: string
    sku: string
}

export interface Adjustment {
    id: number
    doc_no: string
    type: "ADJUSTMENT_IN" | "ADJUSTMENT_OUT"
    note?: string
    posted: boolean
    posted_at?: string
    created_at: string
    branch_name: string
    user_name: string
    items?: AdjustmentItem[]
}

export interface CreateAdjustmentDto {
    branch_id: number | ""
    type: "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" | ""
    note?: string
    items: { product_id: number; qty: number; note?: string }[]
}

interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}

export const adjustmentsApi = {
    list: (params?: {
        branch_id?: number
        date_from?: string
        date_to?: string
    }) =>
        apiClient
            .get<ApiResponse<Adjustment[]>>("/adjustments", { params })
            .then((r) => r.data.data),

    get: (id: number) =>
        apiClient
            .get<ApiResponse<Adjustment>>(`/adjustments/${id}`)
            .then((r) => r.data.data),

    create: (data: CreateAdjustmentDto) =>
        apiClient
            .post<ApiResponse<Adjustment>>("/adjustments", data)
            .then((r) => r.data.data),
}