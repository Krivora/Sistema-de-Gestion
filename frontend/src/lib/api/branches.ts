import { apiClient } from "./client"

export interface Branch {
    id: number
    code: string
    name: string
    address?: string
    phone?: string
    is_active: boolean
    client_name?: string
    created_at: string
}

export interface CreateBranchDto {
    name: string
    address?: string
    phone?: string
    code?: string
}

export interface UpdateBranchDto {
    code?: string
    name?: string
    address?: string
    phone?: string
    is_active?: boolean
}

export const branchesApi = {
    list: () => apiClient.get<Branch[]>("/branches").then((r) => r.data),
    get: (id: number) => apiClient.get<Branch>(`/branches/${id}`).then((r) => r.data),
    create: (data: CreateBranchDto) => apiClient.post<Branch>("/branches", data).then((r) => r.data),
    update: (id: number, data: UpdateBranchDto) => apiClient.put<Branch>(`/branches/${id}`, data).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/branches/${id}/deactivate`).then((r) => r.data),
}