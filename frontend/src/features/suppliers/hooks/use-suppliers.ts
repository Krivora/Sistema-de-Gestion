import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { suppliersApi, type Supplier } from "@/lib/api/suppliers"
import { getApiError } from "@/lib/input-helpers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useSuppliers() {
  const entity = useEntity<Supplier>("suppliers")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; supplier: Supplier | null; action: "deactivate" | "delete"
  }>({ open: false, supplier: null, action: "deactivate" })

  useEffect(() => { entity.load(suppliersApi.list) }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (s, q) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        (s.email?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        (s.phone?.includes(q) ?? false),
    })

  const activeCount = entity.data.filter((s) => s.is_active).length
  const hasActiveFilters = !!search

  function openConfirm(supplier: Supplier, action: "deactivate" | "delete") {
    setConfirmDialog({ open: true, supplier, action })
  }

  async function handleConfirm() {
    const { supplier, action } = confirmDialog
    if (!supplier) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (action === "deactivate") {
      entity.optimisticUpdate(supplier.id, { is_active: false })
      try {
        await suppliersApi.deactivate(supplier.id)
        sileo.success({ title: `"${supplier.name}" desactivado` })
      } catch (err) {
        sileo.error({ title: getApiError(err, "Error al desactivar proveedor") })
      }
    } else {
      entity.optimisticRemove(supplier.id)
      try {
        await suppliersApi.remove(supplier.id)
        sileo.success({ title: `"${supplier.name}" eliminado` })
      } catch (err) {
        sileo.error({ title: getApiError(err, "Error al eliminar proveedor") })
      }
    }

    entity.load(suppliersApi.list, true)
  }

  async function handleActivate(supplier: Supplier) {
    entity.optimisticUpdate(supplier.id, { is_active: true })
    try {
      await suppliersApi.activate(supplier.id)
      sileo.success({ title: `"${supplier.name}" activado` })
      entity.load(suppliersApi.list, true)
    } catch (err) {
      entity.load(suppliersApi.list, true)
      sileo.error({ title: getApiError(err, "Error al activar proveedor") })
    }
  }

  return {
    suppliers: entity.data,
    loading: entity.loading,
    filtered, paginated, activeCount, hasActiveFilters,
    search, setSearch,
    page, setPage, pageSize, setPageSize, totalPages,
    openConfirm, handleConfirm, handleActivate,
    reload: () => entity.load(suppliersApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}