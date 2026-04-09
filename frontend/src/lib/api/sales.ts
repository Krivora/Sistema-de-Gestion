import { apiClient } from "./client"
import type { Sale } from "@/types/api.types"

export const salesApi = {
    list: (params?: Record<string, string>) => apiClient.get<Sale[]>("/sales", { params }).then((r) => r.data),
    get: (id: number) => apiClient.get(`/sales/${id}`).then((r) => r.data),
    create: (data: unknown) => apiClient.post("/sales", data).then((r) => r.data),
}