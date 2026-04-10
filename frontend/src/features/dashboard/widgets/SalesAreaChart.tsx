"use client"
import { BarChart3, Calendar } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { ACCENT, D7, TODAY } from "../constants/dashboard.constants"
import type { SalesDay } from "../types"

function fmt(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { month: "short", day: "numeric" })
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null
    return (
        <div className="db-tooltip">
            <p className="db-tooltip-label">{label}</p>
            <p style={{ color: ACCENT }}>Ventas: {formatCurrency(payload[0].value)}</p>
        </div>
    )
}

interface Props { sales7: SalesDay[]; loading: boolean }

export function SalesAreaChart({ sales7, loading }: Props) {
    const chartData = sales7.map((s) => ({ date: fmt(s.date), total_sales: s.total_sales }))

    return (
        <div className="chart-card">
            <div>
                <div className="section-header">
                    <h2 className="section-title">Ventas — últimos 7 días</h2>
                </div>
                <span className="period-badge"><Calendar size={10} />{D7} → {TODAY}</span>
            </div>
            {loading ? (
                <div className="skeleton-line" style={{ height: 200 }} />
            ) : chartData.length === 0 ? (
                <div className="db-empty"><BarChart3 size={32} /><p>Sin datos de ventas</p></div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="total_sales" name="Ventas" stroke={ACCENT} strokeWidth={2}
                            fill="url(#salesGrad)" dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}