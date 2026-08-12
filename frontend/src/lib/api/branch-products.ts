import { apiClient } from "./client"

export interface BranchProduct {
    id: number
    branch_id: number
    product_id: number
    price: number
    cost: number
    min_stock: number
    reorder_point: number
    currency: string
    is_active: boolean
    product_name: string
    sku: string
    /** Del producto — lo usa el armador de paquetes limitados a una categoría */
    category_id: number | null
    branch_name: string
    client_name: string
    current_stock: number
}

export interface CreateBranchProductDto {
    branch_id: number | ""
    product_id: number | ""
    price: number | ""
    cost: number | ""
    min_stock?: number | ""
    reorder_point?: number | ""
    currency?: string
}

export interface UpdateBranchProductDto {
    price?: number
    cost?: number
    min_stock?: number
    reorder_point?: number
    currency?: string
    is_active?: boolean
}

export const branchProductsApi = {
    list: () => apiClient.get<BranchProduct[]>("/branch-products").then((r) => r.data),
    listByBranch: (branchId: number) =>
        apiClient.get<BranchProduct[]>(`/branch-products/branch/${branchId}`).then((r) => r.data),
    get: (id: number) => apiClient.get<BranchProduct>(`/branch-products/${id}`).then((r) => r.data),
    byBranch: (branchId: number) =>
        apiClient.get<BranchProduct[]>(`/branch-products/branch/${branchId}`).then((r) => r.data),
    create: (data: CreateBranchProductDto) =>
        apiClient.post<BranchProduct>("/branch-products", data).then((r) => r.data),
    update: (id: number, data: UpdateBranchProductDto) =>
        apiClient.put<BranchProduct>(`/branch-products/${id}`, data).then((r) => r.data),
    toggleStatus: (id: number, is_active: boolean) =>
        apiClient.patch(`/branch-products/${id}/status`, { is_active }).then((r) => r.data),
    delete: (id: number) => apiClient.delete(`/branch-products/${id}`).then((r) => r.data),
}