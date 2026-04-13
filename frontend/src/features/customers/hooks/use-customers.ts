import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { customersApi, type Customer } from "@/lib/api/customers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useCustomers() {
  const entity = useEntity<Customer>("customers")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; customer: Customer | null
  }>({ open: false, customer: null })

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

  function openConfirm(customer: Customer) {
    setConfirmDialog({ open: true, customer })
  }

  async function handleDeactivate() {
    const { customer } = confirmDialog
    if (!customer) return
    setConfirmDialog((d) => ({ ...d, open: false }))
    entity.optimisticUpdate(customer.id, { is_active: false })
    try {
      await customersApi.deactivate(customer.id)
      sileo.success({ title: `"${customer.name}" desactivado` })
      entity.load(customersApi.list, true)
    } catch {
      entity.load(customersApi.list, true)
      sileo.error({ title: "Error al desactivar cliente" })
    }
  }

  return {
    customers: entity.data,
    loading: entity.loading,
    activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    openConfirm, handleDeactivate,
    reload: () => entity.load(customersApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}