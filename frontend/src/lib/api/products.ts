import { apiClient } from "./client"

export interface Product {
    id: number
    sku: string
    name: string
    description?: string
    category_id: number
    category_name: string
    status: "active" | "inactive" | "deleted"
    client_id: number
    created_at: string
}

export interface CreateProductDto {
    name: string
    description?: string
    category_id: number | ""
    sku?: string
}

export interface UpdateProductDto {
    name?: string
    description?: string
    category_id?: number
    sku?: string
}

export const productsApi = {
    list: () => apiClient.get<Product[]>("/products").then((r) => r.data),
    get: (id: number) => apiClient.get<Product>(`/products/${id}`).then((r) => r.data),
    create: (data: CreateProductDto) => apiClient.post<Product>("/products", data).then((r) => r.data),
    update: (id: number, data: UpdateProductDto) => apiClient.put<Product>(`/products/${id}`, data).then((r) => r.data),
    activate: (id: number) => apiClient.patch(`/products/${id}/activate`).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/products/${id}/deactivate`).then((r) => r.data),
    delete: (id: number) => apiClient.patch(`/products/${id}/delete`).then((r) => r.data),
}