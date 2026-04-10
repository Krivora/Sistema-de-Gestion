import { apiClient } from "./client"

export interface StockReport {
    branch_name: string
    product_id: number
    product_name: string
    sku: string
    category_name: string
    price: number
    stock: number
}

export interface SalesReport {
    date: string
    sales_count: number
    total_sales: number
}

export interface PurchasesReport {
    date: string
    purchase_count: number
    total_spent: number
}

export interface TopProduct {
    product_name: string
    total_qty: number
    total_sales: number
}

export interface DashboardReport {
    total_sales: number
    total_purchases: number
    total_revenue: number
    total_expense: number
}

export const reportsApi = {
    stock: (params?: { branchId?: number; categoryId?: number }) =>
        apiClient.get<StockReport[]>("/reports/stock", { params }).then((r) => r.data),
    sales: (startDate: string, endDate: string) =>
        apiClient.get<SalesReport[]>("/reports/sales", { params: { startDate, endDate } }).then((r) => r.data),
    purchases: (startDate: string, endDate: string) =>
        apiClient.get<PurchasesReport[]>("/reports/purchases", { params: { startDate, endDate } }).then((r) => r.data),
    topProducts: (limit = 10) =>
        apiClient.get<TopProduct[]>("/reports/top-products", { params: { limit } }).then((r) => r.data),
    dashboard: (startDate: string, endDate: string) =>
        apiClient.get<DashboardReport>("/reports/dashboard", { params: { startDate, endDate } }).then((r) => r.data),
}