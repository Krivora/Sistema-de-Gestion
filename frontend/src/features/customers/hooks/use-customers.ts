import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { customersApi, type Customer } from "@/lib/api/customers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useCustomers() {
  const entity = useEntity<Customer>("customers")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; customer: Customer | null; action: "deactivate" | "activate" | "delete"
  }>({ open: false, customer: null, action: "deactivate" })

  useEffect(() => { entity.load(customersApi.list) }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (c, s) =>
        c.name.toLowerCase().includes(s.toLowerCase()) ||
        (c.email?.toLowerCase().includes(s.toLowerCase()) ?? false) ||
        (c.phone?.includes(s) ?? false),
    })

  const activeCount = entity.data.filter((c) => c.is_active).length

  function openConfirm(customer: Customer, action: "deactivate" | "delete") {
    setConfirmDialog({ open: true, customer, action })
  }

  async function handleConfirm() {
    const { customer, action } = confirmDialog
    if (!customer) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (action === "deactivate") {
      entity.optimisticUpdate(customer.id, { is_active: false })
      try {
        await customersApi.deactivate(customer.id)
        sileo.success({ title: `"${customer.name}" desactivado` })
      } catch {
        sileo.error({ title: "Error al desactivar cliente" })
      }
    } else if (action === "activate") {
      entity.optimisticUpdate(customer.id, { is_active: true })
      try {
        await customersApi.activate(customer.id)
        sileo.success({ title: `"${customer.name}" activado` })
      } catch {
        sileo.error({ title: "Error al activar cliente" })
      }
    } else if (action === "delete") {
      entity.optimisticRemove(customer.id)
      try {
        await customersApi.remove(customer.id)
        sileo.success({ title: `"${customer.name}" eliminado` })
      } catch {
        sileo.error({ title: "Error al eliminar cliente" })
      }
    }

    entity.load(customersApi.list, true)
  }

  async function handleActivate(customer: Customer) {
    entity.optimisticUpdate(customer.id, { is_active: true })
    try {
      await customersApi.activate(customer.id)
      sileo.success({ title: `"${customer.name}" activado` })
      entity.load(customersApi.list, true)
    } catch {
      entity.load(customersApi.list, true)
      sileo.error({ title: "Error al activar cliente" })
    }
  }

  return {
    customers: entity.data,
    loading: entity.loading,
    activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    openConfirm, handleConfirm, handleActivate,
    reload: () => entity.load(customersApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}