import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { getApiError } from "@/lib/input-helpers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export type BranchConfirmType = "deactivate" | "delete"

export function useBranches() {
  const entity = useEntity<Branch>("branches")

  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: BranchConfirmType; branch: Branch | null
  }>({ open: false, type: "deactivate", branch: null })

  useEffect(() => { entity.load(branchesApi.list) }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (b, s) => {
        const matchSearch =
          b.name.toLowerCase().includes(s.toLowerCase()) ||
          b.code.toLowerCase().includes(s.toLowerCase()) ||
          (b.address?.toLowerCase().includes(s.toLowerCase()) ?? false)
        const matchStatus =
          filterStatus === "all"      ? true :
          filterStatus === "active"   ? b.is_active :
          /* inactive */                !b.is_active
        return matchSearch && matchStatus
      },
      extraDeps: [filterStatus],
    })

  const activeCount   = entity.data.filter((b) => b.is_active).length
  const hasActiveFilters = !!(search || filterStatus !== "all")

  function clearFilters() {
    setSearch("")
    setFilterStatus("all")
  }

  async function handleActivate(branch: Branch) {
    entity.optimisticUpdate(branch.id, { is_active: true })
    try {
      await branchesApi.activate(branch.id)
      sileo.success({ title: `"${branch.name}" activada` })
      entity.load(branchesApi.list, true)
    } catch (err) {
      entity.load(branchesApi.list, true)
      sileo.error({ title: getApiError(err, "Error al activar sucursal") })
    }
  }

  function openConfirm(type: BranchConfirmType, branch: Branch) {
    setConfirmDialog({ open: true, type, branch })
  }

  async function handleConfirm() {
    const { type, branch } = confirmDialog
    if (!branch) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (type === "deactivate") entity.optimisticUpdate(branch.id, { is_active: false })
    else                       entity.optimisticRemove(branch.id)

    try {
      if (type === "deactivate") {
        await branchesApi.deactivate(branch.id)
        sileo.success({ title: `"${branch.name}" desactivada` })
      } else {
        await branchesApi.delete(branch.id)
        sileo.success({ title: `"${branch.name}" eliminada` })
      }
      entity.load(branchesApi.list, true)
    } catch (err) {
      entity.load(branchesApi.list, true)
      sileo.error({ title: getApiError(err, type === "deactivate" ? "Error al desactivar" : "Error al eliminar") })
    }
  }

  return {
    branches: entity.data,
    loading: entity.loading,
    activeCount, hasActiveFilters,
    filtered, paginated,
    search, setSearch,
    filterStatus, setFilterStatus,
    clearFilters,
    page, setPage, pageSize, setPageSize, totalPages,
    handleActivate, openConfirm, handleConfirm,
    reload: () => entity.load(branchesApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}