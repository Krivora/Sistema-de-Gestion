// widgets/KpiCards.tsx
"use client"
import { useMemo } from "react"
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react"
import { formatCurrency, toNumber } from "@/lib/utils"
import { ACCENT, BLUE, GREEN, RANGE_LABELS_VERBOSE } from "../constants/dashboard.constants"
import { useDashboardFilter } from "../context/DashboardFilterContext"
import type { DashboardSummary, StockItem } from "../types"

interface Props {
    summary: DashboardSummary | null
    lowStock: StockItem[]
    loading: boolean
}

interface StatCardProps {
    label: string
    value: string | number
    sub?: string
    icon: React.ElementType
    trend?: "up" | "down" | "neutral"
    color: string
    loading?: boolean
}

function StatCard({ label, value, sub, icon: Icon, trend, color, loading }: StatCardProps) {
    return (
        <div className="stat-card">
            <div
                className="stat-icon-wrap"
                style={{ background: `${color}18`, color }}
            >
                <Icon size={18} />
            </div>

            <div className="stat-body">
                <span className="stat-label">{label}</span>

                {loading ? (
                    <div className="skeleton-line" style={{ width: 80, height: 28 }} />
                ) : (
                    <span className="stat-value">{value}</span>
                )}

                {sub && !loading && (
                    <span
                        className={`stat-sub ${
                            trend === "up" ? "sub-up" : trend === "down" ? "sub-down" : ""
                        }`}
                    >
                        {trend === "up" && <ArrowUpRight size={12} />}
                        {trend === "down" && <ArrowDownRight size={12} />}
                        {sub}
                    </span>
                )}
            </div>
        </div>
    )
}

export function KpiCards({ summary, lowStock, loading }: Props) {
    const { range } = useDashboardFilter()
    const labels = RANGE_LABELS_VERBOSE[range]

    const metrics = useMemo(() => {
        const revenue = toNumber(summary?.total_revenue)
        const expense = toNumber(summary?.total_expense)
        const totalSales = toNumber(summary?.total_sales)
        const totalPurchases = toNumber(summary?.total_purchases)
        const profit = revenue - expense
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        return {
            revenue,
            expense,
            totalSales,
            totalPurchases,
            profit,
            margin,
            marginFormatted: margin.toFixed(1),
        }
    }, [summary])

    const stockCount = lowStock.length

    return (
        <div className="stats-grid">
            <StatCard
                label={`Ingresos ${labels.badge}`}
                icon={TrendingUp}
                color={GREEN}
                loading={loading}
                value={summary ? formatCurrency(metrics.revenue) : "—"}
                sub={summary ? `${metrics.totalSales} ventas` : undefined}
                trend="up"
            />

            <StatCard
                label={`Egresos ${labels.badge}`}
                icon={TrendingDown}
                color="#e05c5c"
                loading={loading}
                value={summary ? formatCurrency(metrics.expense) : "—"}
                sub={summary ? `${metrics.totalPurchases} compras` : undefined}
                trend="down"
            />

            <StatCard
                label="Margen neto"
                icon={BarChart3}
                color={BLUE}
                loading={loading}
                value={summary ? `${metrics.marginFormatted}%` : "—"}
                sub={summary ? formatCurrency(metrics.profit) : undefined}
                trend={
                    metrics.margin > 30 ? "up" : metrics.margin > 0 ? "neutral" : "down"
                }
            />

            <StatCard
                label="Alertas stock"
                icon={AlertTriangle}
                color={ACCENT}
                loading={loading}
                value={loading ? "—" : stockCount}
                sub={stockCount > 0 ? "productos bajo mínimo" : "Sin alertas ✓"}
                trend={stockCount > 3 ? "down" : stockCount > 0 ? "neutral" : "up"}
            />
        </div>
    )
}