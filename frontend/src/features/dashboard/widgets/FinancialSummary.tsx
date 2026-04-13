// widgets/FinancialSummary.tsx
"use client"
import { useMemo } from "react"
import { formatCurrency, toNumber } from "@/lib/utils"
import { GREEN, RANGE_LABELS_VERBOSE } from "../constants/dashboard.constants"
import { useDashboardFilter } from "../context/DashboardFilterContext"
import type { DashboardSummary } from "../types"

interface Props {
    summary: DashboardSummary | null
    loading: boolean
}

export function FinancialSummary({ summary, loading }: Props) {
    const { range } = useDashboardFilter()
    const labels = RANGE_LABELS_VERBOSE[range]

    const { revenue, expense, profit, margin, isPositive } = useMemo(() => {
        const revenue = toNumber(summary?.total_revenue)
        const expense = toNumber(summary?.total_expense)
        const profit = revenue - expense
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        return {
            revenue,
            expense,
            profit,
            margin: margin.toFixed(1),
            isPositive: profit >= 0,
        }
    }, [summary])

    return (
        <div className="profit-card">
            <div className="section-header">
                <h2 className="section-title">Resumen financiero</h2>
                <span className="section-sub">{labels.period}</span>
            </div>

            {/* Ganancia neta */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Ganancia neta
                </span>
                {loading ? (
                    <div className="skeleton-line" style={{ height: 44, width: 160 }} />
                ) : (
                    <p
                        className="profit-big"
                        style={{ color: isPositive ? "var(--foreground)" : "#e05c5c" }}
                    >
                        {summary ? formatCurrency(profit) : "—"}
                        <span> MXN</span>
                    </p>
                )}
            </div>

            <div className="profit-divider" />

            {/* Ingresos y egresos */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                    { label: "Ingresos", value: revenue, color: GREEN },
                    { label: "Egresos", value: expense, color: "#e05c5c" },
                ].map(({ label, value, color }) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                            {label}
                        </span>
                        {loading ? (
                            <div className="skeleton-line" style={{ height: 16, width: 90 }} />
                        ) : (
                            <span style={{ fontSize: 14, fontWeight: 700, color }}>
                                {summary ? formatCurrency(value) : "—"}
                            </span>
                        )}
                    </div>
                ))}

                <div className="profit-divider" />

                {/* Margen */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        Margen
                    </span>
                    {loading ? (
                        <div className="skeleton-line" style={{ height: 16, width: 50 }} />
                    ) : (
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: isPositive ? GREEN : "#e05c5c",
                            }}
                        >
                            {margin}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}