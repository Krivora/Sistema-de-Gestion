import { apiClient } from "./client"

export interface Client {
    id: number
    code: string
    name: string
    business_name: string
    logo_url?: string
    max_users: number
    max_branches: number
    email?: string
    phone?: string
    is_active: boolean
    created_at: string
}

export interface CreateClientDto {
    name: string
    business_name?: string
    email?: string
    phone?: string
    max_users?: number
    max_branches?: number
    admin_name: string
    admin_email: string
    admin_password: string
}

export interface UpdateClientDto {
    name?: string
    business_name?: string
    email?: string
    phone?: string
    max_users?: number
    max_branches?: number
    is_active?: boolean
}

export const clientsApi = {
    list: () => apiClient.get<Client[]>("/clients").then((r) => r.data),
    get: (id: number) => apiClient.get<Client>(`/clients/${id}`).then((r) => r.data),
    create: (data: CreateClientDto) => apiClient.post<Client>("/clients", data).then((r) => r.data),
    update: (id: number, data: UpdateClientDto) => apiClient.put<Client>(`/clients/${id}`, data).then((r) => r.data),
    deactivate: (id: number) => apiClient.patch(`/clients/${id}/deactivate`).then((r) => r.data),
    uploadLogo: (id: number, file: File) => {
        const fd = new FormData()
        fd.append("logo", file)
        return apiClient.post<{ url: string; client: Client }>(`/clients/${id}/logo`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data)
    },
}