"use client"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api/client"
import type { DashboardSummary } from "@/types/api.types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ShoppingCart, Package } from "lucide-react"

const today = new Date().toISOString().split("T")[0]
const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]

export default function DashboardPage() {
    const [data, setData] = useState<DashboardSummary | null>(null)

    useEffect(() => {
        apiClient
            .get<DashboardSummary>(`/reports/dashboard?startDate=${startDate}&endDate=${today}`)
            .then((r) => setData(r.data))
            .catch(() => { })
    }, [])

    const cards = [
        { label: "Ventas (30d)", value: data ? formatCurrency(data.total_revenue) : "—", icon: TrendingUp },
        { label: "Gastos (30d)", value: data ? formatCurrency(data.total_expense) : "—", icon: TrendingDown },
        { label: "# Ventas", value: data?.total_sales ?? "—", icon: ShoppingCart },
        { label: "# Compras", value: data?.total_purchases ?? "—", icon: Package },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {cards.map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                            <Icon size={16} className="text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}