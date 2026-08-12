import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { packagesApi, type Package } from "@/lib/api/packages"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export type ConfirmType = "deactivate" | "delete"

export function usePackages() {
  const entity = useEntity<Package>("packages")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: ConfirmType; pkg: Package | null
  }>({ open: false, type: "deactivate", pkg: null })

  useEffect(() => {
    entity.load(packagesApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (p, s) => {
        const q = s.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          // Buscar por lo que trae adentro: "¿en qué paquetes va esta playera?"
          p.items.some((i) => i.product_name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
        )
      },
    })

  const activeCount = entity.data.filter((p) => p.status === "active").length

  async function handleActivate(pkg: Package) {
    entity.optimisticUpdate(pkg.id, { status: "active" })
    try {
      await packagesApi.activate(pkg.id)
      sileo.success({ title: `"${pkg.name}" activado` })
      entity.load(packagesApi.list, true)
    } catch {
      entity.load(packagesApi.list, true)
      sileo.error({ title: "Error al activar paquete" })
    }
  }

  function openConfirm(type: ConfirmType, pkg: Package) {
    setConfirmDialog({ open: true, type, pkg })
  }

  async function handleConfirm() {
    const { type, pkg } = confirmDialog
    if (!pkg) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (type === "deactivate") entity.optimisticUpdate(pkg.id, { status: "inactive" })
    else entity.optimisticRemove(pkg.id)

    try {
      if (type === "deactivate") {
        await packagesApi.deactivate(pkg.id)
        sileo.success({ title: `"${pkg.name}" desactivado` })
      } else {
        await packagesApi.delete(pkg.id)
        sileo.success({ title: `"${pkg.name}" eliminado` })
      }
      entity.load(packagesApi.list, true)
    } catch {
      entity.load(packagesApi.list, true)
      sileo.error({ title: type === "deactivate" ? "Error al desactivar" : "Error al eliminar" })
    }
  }

  return {
    packages: entity.data,
    loading: entity.loading,
    activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    handleActivate, openConfirm, handleConfirm,
    reload: () => entity.load(packagesApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}
