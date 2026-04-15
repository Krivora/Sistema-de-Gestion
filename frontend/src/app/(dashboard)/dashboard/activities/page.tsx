"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { ActivitiesTable } from "@/features/activities/components/activities-table"
import { DataTablePagination } from "@/components/shared/table/data-table-pagination"
import {
  useActivities,
  ACTION_LABELS,
  CATEGORY_LABELS,
  SEVERITY_LABELS,
} from "@/features/activities/hooks/use-activities"

export default function ActivitiesPage() {
  const {
    items, loading, total,
    search,         setSearch,
    filterAction,   setFilterAction,
    filterCategory, setFilterCategory,
    filterSeverity, setFilterSeverity,
    filterStatus,   setFilterStatus,
    page,    setPage,
    pageSize, setPageSize,
    totalPages,
    hasActiveFilters,
  } = useActivities()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Actividad</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Registro de auditoría — {total} eventos totales
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar descripción, usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterAction} onValueChange={(v) => v && setFilterAction(v)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Acción">
              {filterAction === "all" ? "Todas las acciones" : (ACTION_LABELS[filterAction] ?? filterAction)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Categoría">
              {filterCategory === "all" ? "Todas las categorías" : (CATEGORY_LABELS[filterCategory] ?? filterCategory)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={(v) => v && setFilterSeverity(v)}>
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Nivel">
              {filterSeverity === "all" ? "Todos los niveles" : (SEVERITY_LABELS[filterSeverity] ?? filterSeverity)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Estado">
              {filterStatus === "all" ? "Todos los estados" : filterStatus}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="success">Éxito</SelectItem>
            <SelectItem value="failure">Fallido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ActivitiesTable items={items} loading={loading} hasActiveFilters={hasActiveFilters} />

      {!loading && total > 0 && (
        <DataTablePagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          filteredCount={items.length}
          totalCount={total}
          entityLabel="evento"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  )
}