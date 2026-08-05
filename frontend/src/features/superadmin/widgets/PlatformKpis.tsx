"use client"
import { Building2, Users, Wallet, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ACCENT, BLUE, GREEN } from "@/features/dashboard/constants/dashboard.constants"
import type { SuperadminOverview } from "@/lib/api/reports"

interface Props {
    totals: SuperadminOverview["totals"]
    loading: boolean
}

function StatCard({ label, value, sub, icon: Icon, color, loading }: {
    label: string
    value: string | number
    sub?: string
    icon: React.ElementType
    color: string
    loading: boolean
}) {
    return (
        <div className="stat-card">
            <div className="stat-icon-wrap" style={{ background: `${color}18`, color }}>
                <Icon size={18} aria-hidden />
            </div>
            <div className="stat-body">
                <span className="stat-label">{label}</span>
                {loading
                    ? <div className="skeleton-line" style={{ width: 80, height: 24, marginBlock: 2 }} />
                    : <span className="stat-value">{value}</span>}
                {sub && !loading && <span className="stat-sub">{sub}</span>}
            </div>
        </div>
    )
}

const MONTH = new Intl.DateTimeFormat("es-MX", { month: "long" })

export function PlatformKpis({ totals, loading }: Props) {
    const inactiveClients = totals.clients - totals.active_clients
    const monthName = MONTH.format(new Date())

    // El estimado se queda corto cuando hay clientes sin historial de pago:
    // decirlo es más útil que mostrar un número que parece exacto y no lo es.
    const pendingSub = totals.pending_cycles === 0
        ? "Nadie debe ✓"
        : [
            `${totals.pending_cycles} corte${totals.pending_cycles !== 1 ? "s" : ""}`,
            `${totals.pending_clients} cliente${totals.pending_clients !== 1 ? "s" : ""}`,
            totals.pending_unknown > 0 ? `${totals.pending_unknown} sin historial` : null,
        ].filter(Boolean).join(" · ")

    return (
        <div className="stats-grid">
            <StatCard
                label="Clientes activos" icon={Building2} color={ACCENT} loading={loading}
                value={totals.active_clients}
                sub={inactiveClients > 0 ? `${inactiveClients} inactivo${inactiveClients !== 1 ? "s" : ""}` : "Todos activos ✓"}
            />
            <StatCard
                label="Usuarios en el sistema" icon={Users} color={BLUE} loading={loading}
                value={totals.users}
                sub={`en ${totals.branches} sucursal${totals.branches !== 1 ? "es" : ""}`}
            />
            <StatCard
                label={`Cobrado en ${monthName}`} icon={Wallet} color={GREEN} loading={loading}
                value={formatCurrency(totals.collected_month)}
                sub="pagos registrados este mes"
            />
            <StatCard
                label="Pendiente por cobrar" icon={Clock} color="#e05c5c" loading={loading}
                value={totals.pending_amount > 0 ? `~${formatCurrency(totals.pending_amount)}` : "—"}
                sub={pendingSub}
            />
        </div>
    )
}
