// widgets/SalesAreaChart.tsx
"use client"
import { useMemo } from "react"
import { BarChart3, Calendar } from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import {
    formatCurrency,
    formatChartDate,
    toNumber,
} from "@/lib/utils"
import { useDashboardFilter } from "../context/DashboardFilterContext"
import { ACCENT, RANGE_LABELS_VERBOSE } from "../constants/dashboard.constants"
import type { SalesDay } from "../types"

interface Props {
    sales7: SalesDay[]
    loading: boolean
}

interface ChartTooltipProps {
    active?: boolean
    payload?: { value: number }[]
    label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
    if (!active || !payload?.length) return null

    return (
        <div className="db-tooltip">
            <p className="db-tooltip-label">{label}</p>
            <p style={{ color: ACCENT }}>
                Ventas: {formatCurrency(payload[0].value)}
            </p>
        </div>
    )
}

export function SalesAreaChart({ sales7, loading }: Props) {
    const { range, startDate, endDate } = useDashboardFilter()
    const labels = RANGE_LABELS_VERBOSE[range]

    const chartData = useMemo(
        () =>
            sales7.map((s) => ({
                date: formatChartDate(s.date),
                total_sales: toNumber(s.total_sales),
            })),
        [sales7]
    )

    return (
        <div className="chart-card">
            <div>
                <div className="section-header">
                    <h2 className="section-title">{labels.sales}</h2>
                </div>
                <span className="period-badge">
                    <Calendar size={10} />
                    {startDate} → {endDate}
                </span>
            </div>

            {loading ? (
                <div className="skeleton-line" style={{ height: 200 }} />
            ) : chartData.length === 0 ? (
                <div className="db-empty">
                    <BarChart3 size={32} />
                    <p>Sin datos de ventas</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="salesGrad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={ACCENT}
                                    stopOpacity={0.25}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={ACCENT}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) =>
                                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                            }
                        />

                        <Tooltip content={<ChartTooltip />} />

                        <Area
                            type="monotone"
                            dataKey="total_sales"
                            name="Ventas"
                            stroke={ACCENT}
                            strokeWidth={2}
                            fill="url(#salesGrad)"
                            dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                            activeDot={{ r: 5 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}