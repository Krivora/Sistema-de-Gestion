"use client"
import { AlertTriangle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ACCENT } from "../constants/dashboard.constants"
import type { StockItem } from "../types"

interface Props { lowStock: StockItem[]; loading: boolean }

export function LowStockAlert({ lowStock, loading }: Props) {
    if (!loading && lowStock.length === 0) return null

    return (
        <div className="chart-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ background: `${ACCENT}18`, borderRadius: 8, padding: 6, color: ACCENT }}>
                        <AlertTriangle size={14} />
                    </div>
                    <div className="section-header">
                        <h2 className="section-title">Alertas de stock bajo</h2>
                        <span className="section-sub">{lowStock.length} producto{lowStock.length !== 1 ? "s" : ""} bajo mínimo</span>
                    </div>
                </div>
                <Link href="/dashboard/branch-products"
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: ACCENT, textDecoration: "none" }}>
                    Ver inventario <ChevronRight size={13} />
                </Link>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-line" style={{ height: 44, borderRadius: 10 }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {lowStock.map((s, i) => (
                        <div key={i} style={{
                            display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center",
                            padding: "10px 12px", borderRadius: 10, background: "var(--background)",
                            border: "1px solid var(--border)",
                        }}>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{s.product_name}</p>
                                <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.branch_name} · {s.sku}</p>
                            </div>
                            <span style={{
                                padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                                background: s.stock === 0 ? "#e05c5c18" : `${ACCENT}18`,
                                color: s.stock === 0 ? "#e05c5c" : ACCENT,
                            }}>
                                {s.stock === 0 ? "Sin stock" : "Stock bajo"}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, textAlign: "right", color: s.stock === 0 ? "#e05c5c" : ACCENT }}>
                                {Math.floor(s.stock)} unidades
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}