import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useBranches() {
  const entity = useEntity<Branch>("branches")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; branch: Branch | null
  }>({ open: false, branch: null })

  useEffect(() => { entity.load(branchesApi.list) }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (b, s) =>
        b.name.toLowerCase().includes(s.toLowerCase()) ||
        b.code.toLowerCase().includes(s.toLowerCase()) ||
        (b.address?.toLowerCase().includes(s.toLowerCase()) ?? false),
    })

  const activeCount = entity.data.filter((b) => b.is_active).length

  function openConfirm(branch: Branch) {
    setConfirmDialog({ open: true, branch })
  }

  async function handleDeactivate() {
    const { branch } = confirmDialog
    if (!branch) return
    setConfirmDialog((d) => ({ ...d, open: false }))
    entity.optimisticUpdate(branch.id, { is_active: false })
    try {
      await branchesApi.deactivate(branch.id)
      sileo.success({ title: `"${branch.name}" desactivada` })
      entity.load(branchesApi.list, true)
    } catch {
      entity.load(branchesApi.list, true)
      sileo.error({ title: "Error al desactivar sucursal" })
    }
  }

  return {
    branches: entity.data,
    loading: entity.loading,
    activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    openConfirm, handleDeactivate,
    reload: () => entity.load(branchesApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}