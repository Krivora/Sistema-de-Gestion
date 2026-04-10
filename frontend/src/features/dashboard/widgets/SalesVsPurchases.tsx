"use client"
import { Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { ACCENT, BLUE } from "../constants/dashboard.constants"
import type { SalesDay, PurchaseDay } from "../types"

function fmt(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("es-MX", { month: "short", day: "numeric" })
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
    if (!active || !payload?.length) return null
    return (
        <div className="db-tooltip">
            <p className="db-tooltip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
            ))}
        </div>
    )
}

interface Props { sales30: SalesDay[]; purchases30: PurchaseDay[]; loading: boolean }

export function SalesVsPurchases({ sales30, purchases30, loading }: Props) {
    const data = sales30.map((s) => {
        const p = purchases30.find((p) => p.date === s.date)
        return { date: fmt(s.date), Ventas: s.total_sales, Compras: p?.total_spent ?? 0 }
    })

    return (
        <div className="chart-card">
            <div className="section-header">
                <h2 className="section-title">Ventas vs Compras</h2>
                <span className="section-sub">últimos 30 días</span>
            </div>

            {loading ? (
                <div className="skeleton-line" style={{ height: 200 }} />
            ) : data.length === 0 ? (
                <div className="db-empty"><Activity size={32} /><p>Sin datos</p></div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                            interval={Math.floor(data.length / 6)} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="Ventas" fill={ACCENT} radius={[3, 3, 0, 0]} maxBarSize={14} />
                        <Bar dataKey="Compras" fill={BLUE} radius={[3, 3, 0, 0]} maxBarSize={14} />
                    </BarChart>
                </ResponsiveContainer>
            )}

            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                {[{ label: "Ventas", color: ACCENT }, { label: "Compras", color: BLUE }].map(({ label, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--muted-foreground)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    )
}