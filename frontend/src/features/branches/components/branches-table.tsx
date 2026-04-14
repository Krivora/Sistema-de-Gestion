import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Branch } from "@/lib/api/branches"
import type { BranchConfirmType } from "@/features/branches/hooks/use-branches"

interface BranchesTableProps {
  branches: Branch[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (b: Branch) => void
  onActivate: (b: Branch) => void
  onConfirm: (type: BranchConfirmType, b: Branch) => void
}

const columns = (
  onEdit: (b: Branch) => void,
  onActivate: (b: Branch) => void,
  onConfirm: (type: BranchConfirmType, b: Branch) => void,
): ColumnDef<Branch>[] => [
  {
    key: "name", header: "Sucursal", width: "25%",
    cell: (b) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Building2 size={14} className="text-primary" />
        </div>
        <span className="font-medium truncate">{b.name}</span>
      </div>
    ),
  },
  {
    key: "code", header: "Código", width: 120,
    cell: (b) => <span className="font-mono text-xs text-muted-foreground">{b.code}</span>,
  },
  {
    key: "phone", header: "Teléfono", width: 130,
    cell: (b) => <span className="text-muted-foreground">{b.phone ?? "—"}</span>,
  },
  {
    key: "address", header: "Dirección", width: "30%",
    className: "px-4 py-3 text-muted-foreground overflow-hidden",
    cell: (b) => <span className="truncate block">{b.address ?? "—"}</span>,
  },
  {
    key: "status", header: "Estado", width: 100,
    cell: (b) => (
      <Badge variant={b.is_active ? "default" : "secondary"}>
        {b.is_active ? "Activa" : "Inactiva"}
      </Badge>
    ),
  },
  {
    key: "created_at", header: "Creada", width: 120,
    cell: (b) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(b.created_at)}</span>,
  },
  {
    key: "actions", header: "", width: 48,
    cell: (b) => (
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(b)}>Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          {b.is_active && (
            <DropdownMenuItem onClick={() => onConfirm("deactivate", b)} variant="destructive">Desactivar</DropdownMenuItem>
          )}
          {!b.is_active && (
            <>
              <DropdownMenuItem onClick={() => onActivate(b)}>Activar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onConfirm("delete", b)} variant="destructive">Eliminar</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function BranchesTable({ branches, loading, hasActiveFilters, onEdit, onActivate, onConfirm }: BranchesTableProps) {
  return (
    <DataTable
      columns={columns(onEdit, onActivate, onConfirm)}
      data={branches}
      loading={loading}
      rowKey={(b) => b.id}
      emptyIcon={<Building2 size={32} className="text-muted-foreground/40" />}
      emptyText="No hay sucursales registradas"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}