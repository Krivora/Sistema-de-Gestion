import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { branchProductsApi, type BranchProduct } from "@/lib/api/branch-products"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { getApiError } from "@/lib/input-helpers"
import { toNumber } from "@/lib/utils"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"
import { useAuthStore } from "@/store/auth.store"

export type ConfirmType = "toggle" | "delete"

export function useBranchProducts() {
  const user = useAuthStore((s) => s.user)
  const entity = useEntity<BranchProduct>("branch-products")
  const branchesEntity = useEntity<Branch>("branches")

  const [filterBranch, setFilterBranch] = useState<"all" | string>(
    user?.branch_id ? String(user.branch_id) : "all"
  )
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [filterStock, setFilterStock] = useState<"all" | "low">("all")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: ConfirmType; item: BranchProduct | null
  }>({ open: false, type: "toggle", item: null })

  useEffect(() => {
    entity.load(branchProductsApi.list)
    branchesEntity.load(branchesApi.list)
  }, [])

  const activeBranches = branchesEntity.data.filter((b) => b.is_active)

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (i, s) => {
        const matchSearch =
          i.product_name.toLowerCase().includes(s.toLowerCase()) ||
          i.sku.toLowerCase().includes(s.toLowerCase()) ||
          i.branch_name.toLowerCase().includes(s.toLowerCase())
        const matchBranch = filterBranch === "all" || String(i.branch_id) === filterBranch
        const matchStatus = filterStatus === "all" || (filterStatus === "active" ? i.is_active : !i.is_active)
        const matchStock = filterStock === "all"
          || (filterStock === "low" && toNumber(i.current_stock) <= toNumber(i.min_stock))
        return matchSearch && matchBranch && matchStatus && matchStock
      },
      extraDeps: [filterBranch, filterStatus, filterStock],
    })


  const hasActiveFilters = !!(search || filterBranch !== "all" || filterStatus !== "all" || filterStock !== "all")
  // Postgres devuelve los numeric como texto: comparar sin convertir da
  // "17.0000" <= "5.0000" = true y marca en bajo un producto bien surtido.
  const lowStockCount = entity.data.filter(
    (i) => i.is_active && toNumber(i.current_stock) <= toNumber(i.min_stock)
  ).length

  function clearFilters() {
    setSearch("")
    setFilterBranch(user?.branch_id ? String(user.branch_id) : "all")
    setFilterStatus("all")
    setFilterStock("all")
  }

  function openConfirm(type: ConfirmType, item: BranchProduct) {
    setConfirmDialog({ open: true, type, item })
  }

  async function handleToggle() {
    const { item } = confirmDialog
    if (!item) return
    setConfirmDialog((d) => ({ ...d, open: false }))
    entity.optimisticUpdate(item.id, { is_active: !item.is_active })
    try {
      await branchProductsApi.toggleStatus(item.id, !item.is_active)
      sileo.success({ title: `"${item.product_name}" ${item.is_active ? "desactivado" : "activado"}` })
      entity.load(branchProductsApi.list, true)
    } catch (err) {
      entity.load(branchProductsApi.list, true)
      sileo.error({ title: getApiError(err, "Error al cambiar estado") })
    }
  }

  async function handleDelete() {
    const { item } = confirmDialog
    if (!item) return
    setConfirmDialog((d) => ({ ...d, open: false }))
    entity.optimisticRemove(item.id)
    try {
      await branchProductsApi.delete(item.id)
      sileo.success({ title: `"${item.product_name}" eliminado de ${item.branch_name}` })
      entity.load(branchProductsApi.list, true)
    } catch (err) {
      entity.load(branchProductsApi.list, true)
      sileo.error({ title: getApiError(err, "Error al eliminar") })
    }
  }

  async function handleConfirm() {
    if (confirmDialog.type === "toggle") await handleToggle()
    else await handleDelete()
  }

  return {
    items: entity.data,
    branches: activeBranches,
    loading: entity.loading,
    lowStockCount, hasActiveFilters,
    search, setSearch,
    filterBranch, setFilterBranch,
    filterStatus, setFilterStatus,
    filterStock, setFilterStock,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    user, openConfirm, handleConfirm,
    reload: () => entity.load(branchProductsApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}