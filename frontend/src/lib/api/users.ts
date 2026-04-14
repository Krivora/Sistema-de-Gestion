import { apiClient } from "./client"

export interface User {
    id: number
    name: string
    email: string
    role_name: string
    role_id: number
    branch_id?: number
    dark_mode: boolean
    status: "active" | "inactive" | "deleted"
    created_at: string
    client_id?: number
    business_name?: string
    logo_url?: string
    phone?: string
}

export interface CreateUserDto {
    name: string
    email: string
    password: string
    role_id: number | ""
    branch_id?: number | ""
}

export interface UpdateUserDto {
    name?: string
    email?: string
    role_id?: number
    branch_id?: number | null
}

export const usersApi = {
    list: (status?: "active" | "inactive" | "deleted" | "all") =>
        apiClient.get<User[]>("/users", { params: status && status !== "all" ? { status } : undefined }).then((r) => r.data),
    get: (id: number) => apiClient.get<User>(`/users/${id}`).then((r) => r.data),
    create: (data: CreateUserDto) => apiClient.post<User>("/users", data).then((r) => r.data),
    update: (id: number, data: UpdateUserDto) => apiClient.put<User>(`/users/${id}`, data).then((r) => r.data),
    activate: (id: number) => apiClient.patch(`/users/${id}/activate`).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/users/${id}/deactivate`).then((r) => r.data),
    delete: (id: number) => apiClient.patch(`/users/${id}/delete`).then((r) => r.data),
}