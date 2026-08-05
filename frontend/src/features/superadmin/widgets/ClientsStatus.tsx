"use client"
import { Building2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ACCENT } from "@/features/dashboard/constants/dashboard.constants"
import type { SuperadminClientRow } from "@/lib/api/reports"

interface Props {
    clients: SuperadminClientRow[]
    loading: boolean
}

/** Barra de consumo de un límite contratado. Ámbar al llegar al tope. */
function LimitBar({ label, used, max }: { label: string; used: number; max: number }) {
    const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0
    const atLimit = max > 0 && used >= max
    const color = atLimit ? "#e05c5c" : pct >= 80 ? ACCENT : "var(--muted-foreground)"

    return (
        <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color }}>
                    {used}/{max}
                </span>
            </div>
            <div
                role="progressbar"
                aria-valuenow={used} aria-valuemin={0} aria-valuemax={max}
                aria-label={`${label}: ${used} de ${max}`}
                style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}
            >
                <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: 99,
                    background: color === "var(--muted-foreground)" ? "var(--muted-foreground)" : color,
                    opacity: color === "var(--muted-foreground)" ? 0.5 : 1,
                    transition: "width .5s ease",
                }} />
            </div>
        </div>
    )
}

export function ClientsStatus({ clients, loading }: Props) {
    return (
        <div className="chart-card">
            <div className="section-header">
                <h2 className="section-title">Estado y límites por cliente</h2>
                <span className="section-sub">usuarios y sucursales contratados</span>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-line" style={{ height: 52 }} />
                    ))}
                </div>
            ) : clients.length === 0 ? (
                <div className="db-empty"><Building2 size={32} /><p>Sin clientes registrados</p></div>
            ) : (
                <ul style={{ display: "flex", flexDirection: "column", gap: 4, padding: 0, margin: 0, listStyle: "none" }}>
                    {clients.map((c) => (
                        <li
                            key={c.id}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0,1.4fr) minmax(90px,1fr) minmax(90px,1fr)",
                                gap: 12, alignItems: "center",
                                padding: "10px 4px",
                                borderBottom: "1px solid var(--border)",
                            }}
                        >
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span
                                        aria-hidden
                                        title={c.is_active ? "Activo" : "Inactivo"}
                                        style={{
                                            width: 7, height: 7, borderRadius: 99, flexShrink: 0,
                                            background: c.is_active ? "var(--color-success, #22c55e)" : "#e05c5c",
                                        }}
                                    />
                                    <span
                                        title={c.business_name ?? c.name}
                                        style={{
                                            fontSize: 13, fontWeight: 600, color: "var(--foreground)",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}
                                    >
                                        {c.name}
                                    </span>
                                </div>
                                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                                    {c.code} · alta {formatDate(c.created_at)}
                                </span>
                            </div>

                            <LimitBar label="Usuarios" used={c.users_count} max={c.max_users} />
                            <LimitBar label="Sucursales" used={c.branches_count} max={c.max_branches} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
