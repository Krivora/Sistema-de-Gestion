import { apiClient } from "./client"

export interface Supplier {
    id: number
    name: string
    phone?: string
    email?: string
    address?: string
    is_active: boolean
    created_at: string
}

export interface CreateSupplierDto {
    name: string
    phone?: string
    email?: string
    address?: string
}

export interface UpdateSupplierDto {
    name?: string
    phone?: string
    email?: string
    address?: string
}

export const suppliersApi = {
    list: () => apiClient.get<Supplier[]>("/suppliers").then((r) => r.data),
    get: (id: number) => apiClient.get<Supplier>(`/suppliers/${id}`).then((r) => r.data),
    create: (data: CreateSupplierDto) => apiClient.post<Supplier>("/suppliers", data).then((r) => r.data),
    update: (id: number, data: UpdateSupplierDto) => apiClient.put<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/suppliers/${id}/deactivate`).then((r) => r.data),
}