import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Branch } from "@/lib/api/branches"

interface BranchProductsFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  filterBranch: string
  onBranchChange: (v: string) => void
  filterStatus: "all" | "active" | "inactive"
  onStatusChange: (v: "all" | "active" | "inactive") => void
  filterStock: "all" | "low"
  onStockChange: (v: "all" | "low") => void
  branches: Branch[]
  hasActiveFilters: boolean
  onClear: () => void
  showBranchFilter: boolean
}

export function BranchProductsFilters({
  search, onSearchChange,
  filterBranch, onBranchChange,
  filterStatus, onStatusChange,
  filterStock, onStockChange,
  branches, hasActiveFilters, onClear,
  showBranchFilter,
}: BranchProductsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-50 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por producto, SKU o sucursal..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {showBranchFilter && (
        <Select value={filterBranch} onValueChange={onBranchChange}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Sucursal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sucursales</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={filterStatus} onValueChange={(v) => onStatusChange(v as typeof filterStatus)}>
        <SelectTrigger className="w-35"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="inactive">Inactivos</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterStock} onValueChange={(v) => onStockChange(v as typeof filterStock)}>
        <SelectTrigger className="w-37.5"><SelectValue placeholder="Stock" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo el stock</SelectItem>
          <SelectItem value="low">Stock bajo</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}