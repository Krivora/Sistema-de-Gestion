export interface DashboardSummary {
    total_sales: number
    total_purchases: number
    total_revenue: number
    total_expense: number
}

export interface SalesDay {
    date: string
    sales_count: number
    total_sales: number
}

export interface PurchaseDay {
    date: string
    purchase_count: number
    total_spent: number
}

export interface TopProduct {
    product_name: string
    total_qty: number
    total_sales: number
}

export interface StockItem {
    branch_name: string
    product_id: number
    product_name: string
    sku: string
    category_name: string
    price: number
    stock: number
}

export interface DashboardData {
    summary: DashboardSummary | null
    sales7: SalesDay[]
    sales30: SalesDay[]
    purchases30: PurchaseDay[]
    topProducts: TopProduct[]
    lowStock: StockItem[]
}