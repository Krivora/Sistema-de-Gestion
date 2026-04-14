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
                        <div key={i} className="skeleton-line" style={{ height: 14, width: `${85 - i * 8}%` }} />
                    ))}
                </div>
            ) : topProducts.length === 0 ? (
                <div className="db-empty"><Package size={32} /><p>Sin datos</p></div>
            ) : (
                <ol style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: 0, listStyle: "none" }}>
                    {topProducts.map((p, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <span aria-hidden style={{
                                fontSize: 11, fontWeight: 700,
                                color: "var(--muted-foreground)",
                                width: 20, textAlign: "right", flexShrink: 0,
                            }}>
                                #{i + 1}
                            </span>

                            <span style={{
                                fontSize: 12, color: "var(--foreground)",
                                flex: 1, minWidth: 0,
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }} title={p.product_name}>
                                {p.product_name}
                            </span>

                            {/* barra: oculta en <360px via clamp */}
                            <div
                                role="progressbar"
                                aria-valuenow={Math.round((p.total_sales / max) * 100)}
                                aria-valuemin={0} aria-valuemax={100}
                                aria-label={`${p.product_name} ${Math.round((p.total_sales / max) * 100)}%`}
                                style={{
                                    width: "clamp(48px, 12%, 96px)", height: 6,
                                    background: "var(--border)", borderRadius: 99,
                                    overflow: "hidden", flexShrink: 0,
                                }}
                            >
                                <div style={{
                                    height: "100%", borderRadius: 99,
                                    background: PALETTE[i % PALETTE.length],
                                    width: `${(p.total_sales / max) * 100}%`,
                                    transition: "width .5s ease",
                                }} />
                            </div>

                            <span style={{
                                fontSize: 11, color: "var(--muted-foreground)",
                                width: "clamp(56px, 16%, 72px)",
                                textAlign: "right", flexShrink: 0,
                            }}>
                                {formatCurrency(p.total_sales)}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}