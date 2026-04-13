import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { clientsApi, type Client } from "@/lib/api/clients"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useClients() {
    const entity = useEntity<Client>("clients")

    useEffect(() => { entity.load(clientsApi.list) }, [])

    const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
        useTableFilters({
            data: entity.data,
            filterFn: (c, s) =>
                c.name.toLowerCase().includes(s.toLowerCase()) ||
                (c.email?.toLowerCase().includes(s.toLowerCase()) ?? false) ||
                c.code.toLowerCase().includes(s.toLowerCase()),
        })

    async function handleToggle(client: Client) {
        entity.optimisticUpdate(client.id, { is_active: !client.is_active })
        try {
            await clientsApi.deactivate(client.id)
            sileo.success({ title: `Cliente ${client.is_active ? "desactivado" : "activado"}` })
            entity.load(clientsApi.list, true)
        } catch {
            entity.load(clientsApi.list, true)
            sileo.error({ title: "Error al cambiar estado" })
        }
    }

    return {
        clients: entity.data,
        loading: entity.loading,
        search, setSearch,
        page, setPage, pageSize, setPageSize,
        filtered, paginated, totalPages,
        handleToggle,
        reload: () => entity.load(clientsApi.list, true),
    }
}