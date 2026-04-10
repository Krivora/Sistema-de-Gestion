export interface User {
    id: number
    name: string
    email: string
    role_id: number
    role_name: "superadmin" | "admin" | "user"
    branch_id: number | null
    client_id: number
    dark_mode: boolean
    business_name?: string
    logo_url?: string
    phone?: string
    permissions: string[]
}

export interface AbilityRule {
    action: string
    subject: string
}

export interface LoginResponse {
    user: User
    token: string
    ability: AbilityRule[]
}

export interface ApiError {
    error: string
}

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

export interface Sale {
    id: number
    doc_no: string
    status: "open" | "posted" | "cancelled"
    payment_method: string
    subtotal: number
    total: number
    posted_at: string
    created_at: string
    branch_name: string
    user_name: string
}

export interface Branch {
    id: number
    code: string
    name: string
    address?: string
    phone?: string
    is_active: boolean
    client_name: string
    created_at: string
}

export interface Category {
    id: number
    code: string
    name: string
    description?: string
    status: "active" | "inactive" | "deleted"
    created_at: string
}

export interface DashboardSummary {
    total_sales: number
    total_purchases: number
    total_revenue: number
    total_expense: number
}