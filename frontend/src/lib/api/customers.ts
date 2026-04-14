import { apiClient } from "./client"

export interface Customer {
    id: number
    name: string
    phone?: string
    email?: string
    address?: string
    is_active: boolean
    created_at: string
}

export interface CreateCustomerDto {
    name: string
    phone?: string
    email?: string
    address?: string
}

export interface UpdateCustomerDto {
    name?: string
    phone?: string
    email?: string
    address?: string
}

export const customersApi = {
    list: () => apiClient.get<Customer[]>("/customers").then((r) => r.data),
    get: (id: number) => apiClient.get<Customer>(`/customers/${id}`).then((r) => r.data),
    create: (data: CreateCustomerDto) => apiClient.post<Customer>("/customers", data).then((r) => r.data),
    update: (id: number, data: UpdateCustomerDto) => apiClient.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
    activate: (id: number) => apiClient.patch(`/customers/${id}/activate`).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/customers/${id}/deactivate`).then((r) => r.data),
    remove: (id: number) => apiClient.delete(`/customers/${id}`).then((r) => r.data),
}