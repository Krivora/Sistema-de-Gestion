// app/dashboard/page.tsx
"use client"
import { useEffect, useState } from "react"
import { DashboardFilterProvider, useDashboardFilter } from "@/features/dashboard/context/DashboardFilterContext"
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data"
import { DateRangeSelector } from "@/features/dashboard/widgets/DateRangeSelector"
import {
    DashboardHero, KpiCards, SalesAreaChart,
    FinancialSummary, TopProductsChart, SalesVsPurchases,
    LowStockAlert, QuickActions,
} from "@/features/dashboard"
import {
    SuperadminHero, PlatformKpis, BillingSchedule, MarkPaidDialog, GraceDialog,
    InactiveClients, ClientsStatus, useSuperadminData,
} from "@/features/superadmin"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useRole } from "@/hooks/use-role"
import type { SuperadminClientRow } from "@/lib/api/reports"
import styles from "./dashboard.module.css"

function DashboardContent() {
    const { startDate, endDate } = useDashboardFilter()
    const { data, loading, lastUpdate, load } = useDashboardData(startDate, endDate)

    useEffect(() => { load() }, [load])

    return (
        <div className={styles.root}>
            <div className={styles.hero}>
                <DashboardHero loading={loading} lastUpdate={lastUpdate} onRefresh={load} />
                <DateRangeSelector />
            </div>
            <QuickActions />
            <KpiCards summary={data.summary} lowStock={data.lowStock} loading={loading} />
            <div className={styles.chartsPrimary}>
                <SalesAreaChart sales7={data.sales7} loading={loading} />
                <FinancialSummary summary={data.summary} loading={loading} />
            </div>
            <div className={styles.chartsSecondary}>
                <TopProductsChart topProducts={data.topProducts} loading={loading} />
                <SalesVsPurchases sales30={data.sales30} purchases30={data.purchases30} loading={loading} />
            </div>
            <LowStockAlert lowStock={data.lowStock} loading={loading} />
        </div>
    )
}

/**
 * El superadmin no opera un negocio: administra la plataforma. Los widgets de
 * inventario y top de productos sumarían tenants distintos en un mismo número,
 * así que ve su propio panorama por cliente.
 */
function SuperadminContent() {
    const { startDate, endDate } = useDashboardFilter()
    const { data, inactive, loading, lastUpdate, load, undoLastPayment, revokeGrace } =
        useSuperadminData(startDate, endDate)

    const [payingClient, setPayingClient] = useState<SuperadminClientRow | null>(null)
    const [undoClient, setUndoClient] = useState<SuperadminClientRow | null>(null)
    const [graceClient, setGraceClient] = useState<SuperadminClientRow | null>(null)
    const [revokeClient, setRevokeClient] = useState<SuperadminClientRow | null>(null)

    useEffect(() => { load() }, [load])

    return (
        <div className={styles.root}>
            <div className={styles.hero}>
                <SuperadminHero loading={loading} lastUpdate={lastUpdate} onRefresh={load} />
                <DateRangeSelector />
            </div>
            <PlatformKpis totals={data.totals} loading={loading} />
            <div className={styles.chartsSecondary}>
                <BillingSchedule
                    clients={data.clients}
                    loading={loading}
                    onMarkPaid={setPayingClient}
                    onUndo={setUndoClient}
                    onGrace={setGraceClient}
                    onRevokeGrace={setRevokeClient}
                />
                <InactiveClients clients={inactive} loading={loading} />
            </div>
            <ClientsStatus clients={data.clients} loading={loading} />

            <MarkPaidDialog
                client={payingClient}
                onClose={() => setPayingClient(null)}
                onSuccess={load}
            />
            <GraceDialog
                client={graceClient}
                onClose={() => setGraceClient(null)}
                onSuccess={load}
            />
            <ConfirmDialog
                open={!!revokeClient}
                onOpenChange={(o) => !o && setRevokeClient(null)}
                title="Quitar la prórroga"
                description={
                    revokeClient
                        ? `${revokeClient.name} deja de estar protegido. Como debe ${revokeClient.pending_cycles} corte${revokeClient.pending_cycles !== 1 ? "s" : ""}, su cuenta se suspenderá de inmediato y sus usuarios verán el aviso de pago.`
                        : ""
                }
                confirmLabel="Quitar prórroga"
                variant="destructive"
                onConfirm={() => {
                    if (revokeClient) revokeGrace(revokeClient.id)
                    setRevokeClient(null)
                }}
            />
            <ConfirmDialog
                open={!!undoClient}
                onOpenChange={(o) => !o && setUndoClient(null)}
                title="Revertir el último pago"
                description={`Se eliminará el pago más reciente de ${undoClient?.name ?? ""} y el corte volverá a quedar pendiente.`}
                confirmLabel="Revertir"
                variant="destructive"
                onConfirm={() => {
                    if (undoClient) undoLastPayment(undoClient.id)
                    setUndoClient(null)
                }}
            />
        </div>
    )
}

export default function DashboardPage() {
    const { isSuperAdmin } = useRole()

    return (
        <DashboardFilterProvider>
            {isSuperAdmin ? <SuperadminContent /> : <DashboardContent />}
        </DashboardFilterProvider>
    )
}
