import { apiClient } from "./client"

export interface Activity {
  id: number
  client_id: number
  user_id?: number
  user_name: string
  action: string
  description: string
  ref_table?: string
  ref_id?: number
  created_at: string
  ip_address?: string
  user_agent?: string
  severity: "info" | "warning" | "error" | "critical"
  category?: string
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
  metadata?: Record<string, unknown>
  status: "success" | "failure"
  duration_ms?: number
}

export interface ActivityStats {
  by_category: { category: string; total: number }[]
  by_severity: { severity: string; total: number }[]
  by_status:   { status: string; total: number }[]
}

export interface ActivitiesResponse {
  data: Activity[]
  total: number
  page: number
  limit: number
}

export interface ActivityFilters {
  user_id?:   string
  action?:    string
  category?:  string
  severity?:  string
  status?:    string
  ref_table?: string
  ref_id?:    string
  from?:      string
  to?:        string
  page?:      number
  limit?:     number
}

export const activitiesApi = {
  list: (params?: ActivityFilters) =>
    apiClient.get<ActivitiesResponse>("/activities", { params }).then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<Activity>(`/activities/${id}`).then((r) => r.data),

  getByEntity: (refTable: string, refId: number) =>
    apiClient.get<Activity[]>(`/activities/entity/${refTable}/${refId}`).then((r) => r.data),

  stats: (params?: { from?: string; to?: string }) =>
    apiClient.get<ActivityStats>("/activities/stats", { params }).then((r) => r.data),
}