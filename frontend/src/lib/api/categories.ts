import { apiClient } from "./client"

export interface Category {
    id: number
    code: string
    name: string
    description?: string
    status: "active" | "inactive" | "deleted"
    client_name?: string
    created_at: string
}

export interface CreateCategoryDto {
    name: string
    description?: string
    code?: string
}

export interface UpdateCategoryDto {
    name?: string
    description?: string
}

export const categoriesApi = {
    list: () => apiClient.get<Category[]>("/categories").then((r) => r.data),
    get: (id: number) => apiClient.get<Category>(`/categories/${id}`).then((r) => r.data),
    create: (data: CreateCategoryDto) => apiClient.post<Category>("/categories", data).then((r) => r.data),
    update: (id: number, data: UpdateCategoryDto) => apiClient.put<Category>(`/categories/${id}`, data).then((r) => r.data),
    activate: (id: number) => apiClient.patch(`/categories/${id}/activate`).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/categories/${id}/deactivate`).then((r) => r.data),
    delete: (id: number) => apiClient.patch(`/categories/${id}/delete`).then((r) => r.data),
}