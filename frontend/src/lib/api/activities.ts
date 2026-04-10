import { apiClient } from "./client"

export interface Activity {
    id: number
    action: string
    description: string
    ref_table?: string
    ref_id?: number
    created_at: string
    user_name: string
}

export const activitiesApi = {
    list: (params?: { user_id?: number; action?: string; date_from?: string; date_to?: string }) =>
        apiClient.get<Activity[]>("/activities", { params }).then((r) => r.data),
}