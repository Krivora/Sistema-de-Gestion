"use client"
import { useCallback, useMemo, useState } from "react"
import { sileo } from "sileo"
import { reportsApi, type SuperadminOverview, type SuperadminClientRow } from "@/lib/api/reports"
import { getApiError } from "@/lib/input-helpers"

const DAY = 86_400_000

/** Días sin vender. null = nunca ha vendido. */
export function daysSinceLastSale(row: SuperadminClientRow): number | null {
    if (!row.last_sale_at) return null
    const t = new Date(row.last_sale_at).getTime()
    if (Number.isNaN(t)) return null
    return Math.floor((Date.now() - t) / DAY)
}

const EMPTY: SuperadminOverview = {
    totals: {
        clients: 0, active_clients: 0, users: 0, branches: 0, sales_count: 0, revenue: 0,
        collected_month: 0, pending_cycles: 0, pending_clients: 0, pending_amount: 0, pending_unknown: 0,
    },
    clients: [],
}

export function useSuperadminData(startDate: string, endDate: string) {
    const [data, setData] = useState<SuperadminOverview>(EMPTY)
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(() => new Date())

    const load = useCallback(async () => {
        setLoading(true)
        try {
            setData(await reportsApi.superadmin(startDate, endDate))
            setLastUpdate(new Date())
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cargar el panorama del sistema") })
        } finally {
            setLoading(false)
        }
    }, [startDate, endDate])

    // Sin ventas en el periodo: la señal temprana de un cliente que se enfría.
    // Se ordenan por antigüedad — los que nunca vendieron van al final.
    const inactive = useMemo(
        () =>
            data.clients
                .filter((c) => c.sales_count === 0)
                .sort((a, b) => (daysSinceLastSale(b) ?? -1) - (daysSinceLastSale(a) ?? -1)),
        [data.clients]
    )

    const atLimit = useMemo(
        () =>
            data.clients.filter(
                (c) => c.users_count >= c.max_users || c.branches_count >= c.max_branches
            ),
        [data.clients]
    )

    /**
     * Revierte el pago más reciente de un cliente. El panorama no trae el id del
     * pago (una fila por cliente, no por pago), así que se consulta su historial
     * y se borra el del corte más nuevo.
     */
    const undoLastPayment = useCallback(async (clientId: number) => {
        try {
            const payments = await reportsApi.clientPayments(clientId)
            if (!payments.length) {
                sileo.error({ title: "Este cliente no tiene pagos registrados" })
                return
            }
            await reportsApi.deletePayment(clientId, payments[0].id)
            sileo.success({ title: "Pago revertido" })
            await load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al revertir el pago") })
        }
    }, [load])

    /** Cancela la prórroga. El API suspende de inmediato si sigue debiendo. */
    const revokeGrace = useCallback(async (clientId: number) => {
        try {
            const res = await reportsApi.revokeGrace(clientId)
            sileo.success({
                title: res?.suspended
                    ? "Prórroga cancelada — la cuenta quedó suspendida"
                    : "Prórroga cancelada",
            })
            await load()
        } catch (err) {
            sileo.error({ title: getApiError(err, "Error al cancelar la prórroga") })
        }
    }, [load])

    return { data, inactive, atLimit, loading, lastUpdate, load, undoLastPayment, revokeGrace }
}
