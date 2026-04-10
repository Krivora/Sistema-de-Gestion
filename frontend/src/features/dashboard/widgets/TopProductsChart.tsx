"use client"
import { Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PALETTE } from "../constants/dashboard.constants"
import type { TopProduct } from "../types"

interface Props { topProducts: TopProduct[]; loading: boolean }

export function TopProductsChart({ topProducts, loading }: Props) {
    const max = topProducts[0]?.total_sales ?? 1

    return (
        <div className="chart-card">
            <div className="section-header">
                <h2 className="section-title">Top productos vendidos</h2>
                <span className="section-sub">por monto</span>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton-line" style={{ height: 16, width: `${75 + i * 3}%` }} />
                    ))}
                </div>
            ) : topProducts.length === 0 ? (
                <div className="db-empty"><Package size={32} /><p>Sin datos</p></div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {topProducts.map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", width: 18, textAlign: "right", flexShrink: 0 }}>
                                #{i + 1}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--foreground)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                title={p.product_name}>
                                {p.product_name}
                            </span>
                            <div style={{ width: 90, height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
                                <div style={{
                                    height: "100%", borderRadius: 99,
                                    background: PALETTE[i % PALETTE.length],
                                    width: `${(p.total_sales / max) * 100}%`,
                                    transition: "width .6s ease",
                                }} />
                            </div>
                            <span style={{ fontSize: 11, color: "var(--muted-foreground)", width: 70, textAlign: "right", flexShrink: 0 }}>
                                {formatCurrency(p.total_sales)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}