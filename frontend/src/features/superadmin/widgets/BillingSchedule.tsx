"use client"
import { CalendarClock, Check, Undo2, X } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { SuperadminClientRow } from "@/lib/api/reports"

interface Props {
    clients: SuperadminClientRow[]
    loading: boolean
    onMarkPaid: (client: SuperadminClientRow) => void
    onUndo: (client: SuperadminClientRow) => void
    onGrace: (client: SuperadminClientRow) => void
    onRevokeGrace: (client: SuperadminClientRow) => void
}

const DAY = 86_400_000

/** Días entre hoy y una fecha: negativo = ya pasó. */
function daysUntil(date: string) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.round((d.getTime() - today.getTime()) / DAY)
}

type Status = {
    label: string
    detail: string
    color: string
    /** Hay un corte vencido sin pagar */
    owes: boolean
}

function billingStatus(c: SuperadminClientRow): Status {
    // Suspendido por el sistema: es el estado más importante que puede tener
    if (!c.is_active && c.suspended_for_payment) {
        return {
            label: "Suspendido",
            detail: `acceso bloqueado · debe ${c.pending_cycles} corte${c.pending_cycles !== 1 ? "s" : ""}`,
            color: "#e05c5c",
            owes: true,
        }
    }

    if (!c.is_active) {
        return {
            label: "Desactivado",
            detail: "apagado manualmente desde Clientes",
            color: "var(--muted-foreground)",
            owes: c.pending_cycles > 0,
        }
    }

    if (c.has_grace) {
        return {
            label: "Con prórroga",
            detail: c.pending_cycles > 0
                ? `debe ${c.pending_cycles} corte${c.pending_cycles !== 1 ? "s" : ""} · con chance hasta ${formatDate(c.grace_until!)}`
                : `protegido hasta ${formatDate(c.grace_until!)}`,
            color: "#d97757",
            owes: c.pending_cycles > 0,
        }
    }

    // Menos de un mes desde el alta: todavía no le toca nada
    if (c.cycles_due === 0) {
        const d = daysUntil(c.next_due)
        return {
            label: "Primer corte",
            detail: `en ${d} día${d !== 1 ? "s" : ""} · ${formatDate(c.next_due)}`,
            color: "var(--muted-foreground)",
            owes: false,
        }
    }

    if (c.pending_cycles === 0) {
        const d = daysUntil(c.next_due)
        return {
            label: "Al corriente",
            detail: `próximo corte ${formatDate(c.next_due)}${d >= 0 ? ` · en ${d} día${d !== 1 ? "s" : ""}` : ""}`,
            color: "var(--color-success, #22c55e)",
            owes: false,
        }
    }

    // El más antiguo sin pagar: es el que refleja el atraso real
    const due = c.oldest_unpaid_due ?? c.current_due!
    const overdue = -daysUntil(due)
    return {
        label: c.pending_cycles > 1 ? `Debe ${c.pending_cycles} cortes` : "Pendiente",
        detail: overdue > 0
            ? `corte ${formatDate(due)} · vencido hace ${overdue} día${overdue !== 1 ? "s" : ""}`
            : `corte ${formatDate(due)} · vence hoy`,
        color: overdue >= 15 ? "#e05c5c" : "#d97757",
        owes: true,
    }
}

export function BillingSchedule({ clients, loading, onMarkPaid, onUndo, onGrace, onRevokeGrace }: Props) {
    return (
        <div className="chart-card">
            <div className="section-header">
                <h2 className="section-title">Cortes de pago</h2>
                <span className="section-sub">un mes a partir del alta</span>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-line" style={{ height: 44 }} />
                    ))}
                </div>
            ) : clients.length === 0 ? (
                <div className="db-empty"><CalendarClock size={32} /><p>Sin clientes registrados</p></div>
            ) : (
                <ul style={{ display: "flex", flexDirection: "column", gap: 6, padding: 0, margin: 0, listStyle: "none" }}>
                    {clients.map((c) => {
                        const st = billingStatus(c)
                        return (
                            <li
                                key={c.id}
                                style={{
                                    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                                    padding: "10px 12px", borderRadius: 10,
                                    background: st.owes ? `${st.color}10` : "transparent",
                                    border: `1px solid ${st.owes ? `${st.color}30` : "var(--border)"}`,
                                }}
                            >
                                <div style={{ minWidth: 0, flex: "1 1 180px" }}>
                                    <p style={{
                                        fontSize: 13, fontWeight: 600, color: "var(--foreground)",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {c.name}
                                    </p>
                                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                                        {st.detail}
                                    </p>
                                </div>

                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: st.color }}>{st.label}</p>
                                    <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                                        {c.last_payment_amount != null
                                            ? `último ${formatCurrency(c.last_payment_amount)}`
                                            : "sin pagos aún"}
                                    </p>
                                </div>

                                {st.owes ? (
                                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                        <Button size="sm" className="h-7 text-xs" onClick={() => onMarkPaid(c)}>
                                            <Check size={13} className="mr-1" />
                                            Marcar pagado
                                        </Button>
                                        <Button
                                            size="sm" variant="outline" className="h-7 text-xs"
                                            onClick={() => onGrace(c)}
                                            title="Reactivar sin registrar pago: la deuda se conserva"
                                        >
                                            <CalendarClock size={13} className="mr-1" />
                                            {c.has_grace ? "Extender" : "Prórroga"}
                                        </Button>
                                        {c.has_grace && (
                                            <Button
                                                size="sm" variant="ghost"
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => onRevokeGrace(c)}
                                                title="Quitar la prórroga: si sigue debiendo, se suspende de inmediato"
                                                aria-label={`Quitar prórroga a ${c.name}`}
                                            >
                                                <X size={14} />
                                            </Button>
                                        )}
                                    </div>
                                ) : c.paid_cycles > 0 ? (
                                    <Button
                                        size="sm" variant="ghost"
                                        className="h-7 text-xs text-muted-foreground"
                                        onClick={() => onUndo(c)}
                                        title="Revertir el último pago registrado"
                                    >
                                        <Undo2 size={13} className="mr-1" />
                                        Revertir
                                    </Button>
                                ) : (
                                    <span style={{ width: 1 }} />
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
