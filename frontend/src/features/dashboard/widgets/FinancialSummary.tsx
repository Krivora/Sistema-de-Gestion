"use client"
import { formatCurrency } from "@/lib/utils"
import { GREEN, ACCENT } from "../constants/dashboard.constants"
import type { DashboardSummary } from "../types"

interface Props { summary: DashboardSummary | null; loading: boolean }

export function FinancialSummary({ summary, loading }: Props) {
    const profit = summary ? summary.total_revenue - summary.total_expense : 0
    const margin = summary?.total_revenue
        ? ((profit / summary.total_revenue) * 100).toFixed(1)
        : "0.0"
    const isPositive = profit >= 0

    return (
        <div className="profit-card">
            <div className="section-header">
                <h2 className="section-title">Resumen financiero</h2>
                <span className="section-sub">30 días</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Ganancia neta</span>
                {loading
                    ? <div className="skeleton-line" style={{ height: 44, width: 160 }} />
                    : <p className="profit-big" style={{ color: isPositive ? "var(--foreground)" : "#e05c5c" }}>
                        {summary ? formatCurrency(profit) : "—"}
                        <span> MXN</span>
                    </p>
                }
            </div>

            <div className="profit-divider" />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                    { label: "Ingresos", value: summary?.total_revenue, color: GREEN },
                    { label: "Egresos", value: summary?.total_expense, color: "#e05c5c" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{label}</span>
                        {loading
                            ? <div className="skeleton-line" style={{ height: 16, width: 90 }} />
                            : <span style={{ fontSize: 14, fontWeight: 700, color }}>
                                {value !== undefined ? formatCurrency(value) : "—"}
                            </span>
                        }
                    </div>
                ))}
                <div className="profit-divider" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Margen</span>
                    {loading
                        ? <div className="skeleton-line" style={{ height: 16, width: 50 }} />
                        : <span style={{ fontSize: 14, fontWeight: 700, color: isPositive ? GREEN : "#e05c5c" }}>
                            {margin}%
                        </span>
                    }
                </div>
            </div>
        </div>
    )
}