"use client"

import { useMemo, useState } from "react"
import { Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ProductsTable } from "@/features/products/components/products-table"
import { ProductDialog } from "@/features/products/components/product-dialog"
import { useProducts } from "@/features/products/hooks/use-products"
import type { Product } from "@/lib/api/products"

export default function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)

  const {
    products,
    categories,
    loading,
    filtered,
    paginated,
    activeCount,
    hasActiveFilters,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    clearFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    handleActivate,
    openConfirm,
    handleConfirm,
    reload,
    confirmDialog,
    setConfirmDialog,
  } = useProducts()

  const selectedFilterCategory = useMemo(
    () => categories.find((c) => String(c.id) === filterCategory),
    [categories, filterCategory]
  )

  const statusLabel: Record<string, string> = {
    all: "Todos los estados",
    active: "Activos",
    inactive: "Inactivos",
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} producto{activeCount !== 1 ? "s" : ""} activo
            {activeCount !== 1 ? "s" : ""}
          </p>
        </div>

        <Button
          onClick={() => {
            setSelected(null)
            setDialogOpen(true)
          }}
          size="sm"
        >
          <Plus size={16} className="mr-2" />
          Nuevo producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        {/* Buscador */}
        <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtro de Estado */}
        <Select
          value={filterStatus}
          onValueChange={(v) =>
            setFilterStatus(v as typeof filterStatus)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue>
              {statusLabel[filterStatus]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro de Categoría */}
        <Select
          value={filterCategory}
          onValueChange={(v) => setFilterCategory(v ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue>
              {filterCategory === "all"
                ? "Todas las categorías"
                : selectedFilterCategory?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              Todas las categorías
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                value={String(cat.id)}
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="sm:ml-auto text-muted-foreground"
          >
            <X size={14} className="mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla */}
      <ProductsTable
        products={paginated}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        onEdit={(p) => {
          setSelected(p)
          setDialogOpen(true)
        }}
        onActivate={handleActivate}
        onConfirm={openConfirm}
      />

      {/* Paginación */}
      {!loading && filtered.length > 0 && (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          filteredCount={filtered.length}
          totalCount={products.length}
          entityLabel="producto"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* Confirmación */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((d) => ({ ...d, open }))
        }
        title={
          confirmDialog.type === "delete"
            ? "¿Eliminar producto?"
            : "¿Desactivar producto?"
        }
        description={
          confirmDialog.type === "delete"
            ? `"${confirmDialog.product?.name}" será eliminado permanentemente. Esta acción no se puede deshacer.`
            : `"${confirmDialog.product?.name}" quedará inactivo hasta que lo actives de nuevo.`
        }
        confirmLabel={
          confirmDialog.type === "delete"
            ? "Eliminar"
            : "Desactivar"
        }
        variant={
          confirmDialog.type === "delete"
            ? "destructive"
            : "default"
        }
        onConfirm={handleConfirm}
      />

      {/* Diálogo de Producto */}
      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={selected}
        onSuccess={() => {
          setDialogOpen(false)
          reload()
        }}
      />
    </div>
  )
}