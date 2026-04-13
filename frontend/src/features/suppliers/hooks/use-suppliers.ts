import { useEffect } from "react"
import { sileo } from "sileo"
import { suppliersApi, type Supplier } from "@/lib/api/suppliers"
import { getApiError } from "@/lib/input-helpers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useSuppliers() {
  const suppliers = useEntity<Supplier>("suppliers")

  useEffect(() => {
    suppliers.load(suppliersApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: suppliers.data,
      filterFn: (s, q) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        (s.email?.toLowerCase().includes(q.toLowerCase()) ?? false) ||
        (s.phone?.includes(q) ?? false),
    })

  const activeCount = suppliers.data.filter((s) => s.is_active).length
  const hasActiveFilters = !!search

  async function handleDeactivate(supplier: Supplier) {
    suppliers.optimisticUpdate(supplier.id, { is_active: false })
    try {
      await suppliersApi.deactivate(supplier.id)
      sileo.success({ title: `"${supplier.name}" desactivado` })
      suppliers.load(suppliersApi.list, true)
    } catch (err) {
      suppliers.load(suppliersApi.list, true)
      sileo.error({ title: getApiError(err, "Error al desactivar proveedor") })
    }
  }

  return {
    suppliers: suppliers.data,
    loading: suppliers.loading,
    filtered, paginated, activeCount, hasActiveFilters,
    search, setSearch,
    page, setPage, pageSize, setPageSize, totalPages,
    handleDeactivate,
    reload: () => suppliers.load(suppliersApi.list, true),
  }
}