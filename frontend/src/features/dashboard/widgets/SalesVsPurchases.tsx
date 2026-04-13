// widgets/SalesVsPurchases.tsx
"use client"
import { useMemo } from "react"
import { Activity } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { formatCurrency, formatChartDate, toNumber } from "@/lib/utils"
import { ACCENT, BLUE, RANGE_LABELS_VERBOSE } from "../constants/dashboard.constants"
import { useDashboardFilter } from "../context/DashboardFilterContext"
import type { SalesDay, PurchaseDay } from "../types"

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean
    payload?: { value: number; name: string; color: string }[]
    label?: string
}) {
    if (!active || !payload?.length) return null

    return (
        <div className="db-tooltip">
            <p className="db-tooltip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {formatCurrency(p.value)}
                </p>
            ))}
        </div>
    )
}

interface Props {
    sales30: SalesDay[]
    purchases30: PurchaseDay[]
    loading: boolean
}

export function SalesVsPurchases({ sales30, purchases30, loading }: Props) {
    const { range } = useDashboardFilter()
    const labels = RANGE_LABELS_VERBOSE[range]

    const data = useMemo(() => {
        if (!sales30.length && !purchases30.length) return []

        const salesMap = new Map(
            sales30.map((s) => [s.date, toNumber(s.total_sales)])
        )
        const purchasesMap = new Map(
            purchases30.map((p) => [p.date, toNumber(p.total_spent)])
        )

        const allDates = Array.from(
            new Set([...salesMap.keys(), ...purchasesMap.keys()])
        ).sort()

        return allDates.map((date) => ({
            date: formatChartDate(date),
            Ventas: salesMap.get(date) ?? 0,
            Compras: purchasesMap.get(date) ?? 0,
        }))
    }, [sales30, purchases30])

    const xAxisInterval = useMemo(() => {
        if (data.length <= 6) return 0
        return Math.ceil(data.length / 6)
    }, [data.length])

    return (
        <div className="chart-card">
            <div className="section-header">
                <h2 className="section-title">Ventas vs Compras</h2>
                <span className="section-sub">{labels.comparison}</span>
            </div>

            {loading ? (
                <div className="skeleton-line" style={{ height: 200 }} />
            ) : data.length === 0 ? (
                <div className="db-empty">
                    <Activity size={32} />
                    <p>Sin datos</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                            interval={xAxisInterval}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) =>
                                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                            }
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                            dataKey="Ventas"
                            fill={ACCENT}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={14}
                        />
                        <Bar
                            dataKey="Compras"
                            fill={BLUE}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={14}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}

            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                {[
                    { label: "Ventas", color: ACCENT },
                    { label: "Compras", color: BLUE },
                ].map(({ label, color }) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            color: "var(--muted-foreground)",
                        }}
                    >
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: color,
                            }}
                        />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    )
}