import { apiClient } from "./client"

export interface TransferItem {
    id: number
    qty: number
    product_name: string
    sku: string
}

export interface Transfer {
    id: number
    doc_no: string
    posted: boolean
    posted_at?: string
    note?: string
    created_at: string
    from_branch_name: string
    to_branch_name: string
    user_name: string
    items?: TransferItem[]
}

export interface CreateTransferDto {
    from_branch_id: number | ""
    to_branch_id: number | ""
    note?: string
    items: { product_id: number; qty: number }[]
}

export const transfersApi = {
    list: (params?: { from_branch_id?: number; to_branch_id?: number; date_from?: string; date_to?: string }) =>
        apiClient.get<Transfer[]>("/transfers", { params }).then((r) => r.data),
    get: (id: number) => apiClient.get<Transfer>(`/transfers/${id}`).then((r) => r.data),
    create: (data: CreateTransferDto) => apiClient.post<Transfer>("/transfers", data).then((r) => r.data),
}