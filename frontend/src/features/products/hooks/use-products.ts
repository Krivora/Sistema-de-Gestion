import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { productsApi, type Product } from "@/lib/api/products"
import { categoriesApi, type Category } from "@/lib/api/categories"
import { getApiError } from "@/lib/input-helpers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export type ConfirmType = "deactivate" | "delete"

export function useProducts() {
  const products = useEntity<Product>("products")
  const categories = useEntity<Category>("categories")

  const [filterStatus, setFilterStatus] = useState<"all" | Product["status"]>("all")
  const [filterCategory, setFilterCategory] = useState<"all" | string>("all")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: ConfirmType; product: Product | null
  }>({ open: false, type: "deactivate", product: null })

  useEffect(() => {
    products.load(productsApi.list)
    categories.load(categoriesApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: products.data,
      filterFn: (p, s) => {
        const matchSearch =
          p.name.toLowerCase().includes(s.toLowerCase()) ||
          p.sku.toLowerCase().includes(s.toLowerCase()) ||
          p.category_name.toLowerCase().includes(s.toLowerCase())
        const matchStatus = filterStatus === "all" || p.status === filterStatus
        const matchCategory = filterCategory === "all" || String(p.category_id) === filterCategory
        return matchSearch && matchStatus && matchCategory
      },
      extraDeps: [filterStatus, filterCategory],
    })

  const activeCount = products.data.filter((p) => p.status === "active").length
  const hasActiveFilters = !!(search || filterStatus !== "all" || filterCategory !== "all")

  function clearFilters() {
    setSearch("")
    setFilterStatus("all")
    setFilterCategory("all")
  }

  async function handleActivate(product: Product) {
    products.optimisticUpdate(product.id, { status: "active" })
    try {
      await productsApi.activate(product.id)
      sileo.success({ title: `"${product.name}" activado` })
      products.load(productsApi.list, true)
    } catch (err) {
      products.load(productsApi.list, true)
      sileo.error({ title: getApiError(err, "Error al activar") })
    }
  }

  function openConfirm(type: ConfirmType, product: Product) {
    setConfirmDialog({ open: true, type, product })
  }

  async function handleConfirm() {
    const { type, product } = confirmDialog
    if (!product) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (type === "deactivate") products.optimisticUpdate(product.id, { status: "inactive" })
    else products.optimisticRemove(product.id)

    try {
      if (type === "deactivate") {
        await productsApi.deactivate(product.id)
        sileo.success({ title: `"${product.name}" desactivado` })
      } else {
        await productsApi.delete(product.id)
        sileo.success({ title: `"${product.name}" eliminado` })
      }
      products.load(productsApi.list, true)
    } catch (err) {
      products.load(productsApi.list, true)
      sileo.error({ title: getApiError(err, type === "deactivate" ? "Error al desactivar" : "Error al eliminar") })
    }
  }

  return {
    products: products.data,
    categories: categories.data,
    loading: products.loading,
    filtered, paginated, activeCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterCategory, setFilterCategory,
    clearFilters,
    page, setPage, pageSize, setPageSize, totalPages,
    handleActivate, openConfirm, handleConfirm,
    reload: () => products.load(productsApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}