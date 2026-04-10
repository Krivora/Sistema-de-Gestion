"use client"
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ACCENT, BLUE, GREEN } from "../constants/dashboard.constants"
import type { DashboardSummary, StockItem } from "../types"

interface Props {
    summary: DashboardSummary | null
    lowStock: StockItem[]
    loading: boolean
}

function StatCard({
    label, value, sub, icon: Icon, trend, color, loading,
}: {
    label: string; value: string | number; sub?: string
    icon: React.ElementType; trend?: "up" | "down" | "neutral"
    color: string; loading?: boolean
}) {
    return (
        <div className="stat-card">
            <div className="stat-icon-wrap" style={{ background: `${color}18`, color }}>
                <Icon size={18} />
            </div>
            <div className="stat-body">
                <span className="stat-label">{label}</span>
                {loading
                    ? <div className="skeleton-line" style={{ width: 80, height: 28 }} />
                    : <span className="stat-value">{value}</span>
                }
                {sub && !loading && (
                    <span className={`stat-sub ${trend === "up" ? "sub-up" : trend === "down" ? "sub-down" : ""}`}>
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
    const profit = summary ? summary.total_revenue - summary.total_expense : 0
    const margin = summary?.total_revenue
        ? ((profit / summary.total_revenue) * 100).toFixed(1)
        : "0.0"

    return (
        <div className="stats-grid">
            <StatCard
                label="Ingresos 30d" icon={TrendingUp} color={GREEN} loading={loading}
                value={summary ? formatCurrency(summary.total_revenue) : "—"}
                sub={summary ? `${summary.total_sales} ventas` : undefined}
            />
            <StatCard
                label="Egresos 30d" icon={TrendingDown} color="#e05c5c" loading={loading}
                value={summary ? formatCurrency(summary.total_expense) : "—"}
                sub={summary ? `${summary.total_purchases} compras` : undefined}
            />
            <StatCard
                label="Margen neto" icon={BarChart3} color={BLUE} loading={loading}
                value={summary ? `${margin}%` : "—"}
                trend={Number(margin) > 30 ? "up" : Number(margin) > 0 ? "neutral" : "down"}
                sub={summary ? formatCurrency(profit) : undefined}
            />
            <StatCard
                label="Alertas stock" icon={AlertTriangle} color={ACCENT} loading={loading}
                value={loading ? "—" : lowStock.length}
                sub={lowStock.length > 0 ? "productos bajo mínimo" : "Sin alertas ✓"}
                trend={lowStock.length > 3 ? "down" : lowStock.length > 0 ? "neutral" : "up"}
            />
        </div>
    )
}