"use client"
import Link from "next/link"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { daysSinceLastSale } from "../hooks/use-superadmin-data"
import type { SuperadminClientRow } from "@/lib/api/reports"

interface Props {
    clients: SuperadminClientRow[]
    loading: boolean
}

/** "hace 18 días" / "nunca ha vendido" */
function inactivityLabel(row: SuperadminClientRow) {
    const days = daysSinceLastSale(row)
    if (days === null) return { text: "Nunca ha registrado una venta", severe: true }
    if (days === 0) return { text: "Vendió hoy, pero nada en el periodo filtrado", severe: false }
    return {
        text: `Última venta hace ${days} día${days !== 1 ? "s" : ""} — ${formatDate(row.last_sale_at!)}`,
        severe: days >= 30,
    }
}

export function InactiveClients({ clients, loading }: Props) {
    return (
        <div className="chart-card">
            <div className="section-header">
                <h2 className="section-title">Clientes sin ventas en el periodo</h2>
                <span className="section-sub">
                    {loading ? "" : `${clients.length} de seguimiento`}
                </span>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="skeleton-line" style={{ height: 34 }} />
                    ))}
                </div>
            ) : clients.length === 0 ? (
                <div className="db-empty">
                    <CheckCircle2 size={32} />
                    <p>Todos los clientes registraron ventas ✓</p>
                </div>
            ) : (
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
                    {clients.map((c) => {
                        const { text, severe } = inactivityLabel(c)
                        return (
                            <li
                                key={c.id}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    padding: "10px 12px", borderRadius: 10,
                                    background: severe ? "#e05c5c12" : "var(--border)",
                                    border: `1px solid ${severe ? "#e05c5c35" : "transparent"}`,
                                }}
                            >
                                <AlertTriangle
                                    size={15} aria-hidden
                                    style={{ color: severe ? "#e05c5c" : "var(--muted-foreground)", flexShrink: 0 }}
                                />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{
                                        fontSize: 13, fontWeight: 600, color: "var(--foreground)",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {c.name}
                                        {!c.is_active && (
                                            <span style={{ fontSize: 11, fontWeight: 500, color: "#e05c5c", marginLeft: 8 }}>
                                                inactivo
                                            </span>
                                        )}
                                    </p>
                                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{text}</p>
                                </div>
                                <Link
                                    href={`/dashboard/clients?id=${c.id}`}
                                    style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0, textDecoration: "underline" }}
                                >
                                    Ver
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
