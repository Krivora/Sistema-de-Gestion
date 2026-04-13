import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export type ConfirmType = "deactivate" | "delete"

export function useCategories() {
  const entity = useEntity<Category>("categories")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: ConfirmType; category: Category | null
  }>({ open: false, type: "deactivate", category: null })

  useEffect(() => {
    entity.load(categoriesApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (c, s) =>
        c.name.toLowerCase().includes(s.toLowerCase()) ||
        c.code.toLowerCase().includes(s.toLowerCase()) ||
        (c.description?.toLowerCase().includes(s.toLowerCase()) ?? false),
    })

  const activeCount = entity.data.filter((c) => c.status === "active").length

  async function handleActivate(cat: Category) {
    entity.optimisticUpdate(cat.id, { status: "active" })
    try {
      await categoriesApi.activate(cat.id)
      sileo.success({ title: `"${cat.name}" activada` })
      entity.load(categoriesApi.list, true)
    } catch {
      entity.load(categoriesApi.list, true)
      sileo.error({ title: "Error al activar categoría" })
    }
  }

  function openConfirm(type: ConfirmType, category: Category) {
    setConfirmDialog({ open: true, type, category })
  }

  async function handleConfirm() {
    const { type, category } = confirmDialog
    if (!category) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (type === "deactivate") entity.optimisticUpdate(category.id, { status: "inactive" })
    else entity.optimisticRemove(category.id)

    try {
      if (type === "deactivate") {
        await categoriesApi.deactivate(category.id)
        sileo.success({ title: `"${category.name}" desactivada` })
      } else {
        await categoriesApi.delete(category.id)
        sileo.success({ title: `"${category.name}" eliminada` })
      }
      entity.load(categoriesApi.list, true)
    } catch {
      entity.load(categoriesApi.list, true)
      sileo.error({ title: type === "deactivate" ? "Error al desactivar" : "Error al eliminar" })
    }
  }

  return {
    categories: entity.data,
    loading: entity.loading,
    activeCount,
    search, setSearch,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    handleActivate, openConfirm, handleConfirm,
    reload: () => entity.load(categoriesApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}