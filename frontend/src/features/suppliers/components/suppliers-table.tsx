import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Truck, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Supplier } from "@/lib/api/suppliers"

interface SuppliersTableProps {
  suppliers: Supplier[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (s: Supplier) => void
  onDeactivate: (s: Supplier) => void
}

const columns = (
  onEdit: (s: Supplier) => void,
  onDeactivate: (s: Supplier) => void,
): ColumnDef<Supplier>[] => [
  {
    key: "name", header: "Proveedor", width: "25%",
    cell: (s) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {s.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium truncate">{s.name}</span>
      </div>
    ),
  },
  {
    key: "phone", header: "Teléfono", width: 140,
    cell: (s) => <span className="text-muted-foreground">{s.phone ?? "—"}</span>,
  },
  {
    key: "email", header: "Email", width: "20%",
    cell: (s) => <span className="text-muted-foreground truncate block">{s.email ?? "—"}</span>,
  },
  {
    key: "address", header: "Dirección", width: "20%",
    cell: (s) => (
      <span className="text-muted-foreground truncate block max-w-[200px]">{s.address ?? "—"}</span>
    ),
  },
  {
    key: "is_active", header: "Estado", width: 100,
    cell: (s) => (
      <Badge variant={s.is_active ? "default" : "secondary"}>
        {s.is_active ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    key: "created_at", header: "Registrado", width: 120,
    cell: (s) => (
      <span className="text-muted-foreground whitespace-nowrap">{formatDate(s.created_at)}</span>
    ),
  },
  {
    key: "actions", header: "", width: 48,
    cell: (s) => (
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(s)}>Editar</DropdownMenuItem>
          {s.is_active && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeactivate(s)} variant="destructive">
                Desactivar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function SuppliersTable({ suppliers, loading, hasActiveFilters, onEdit, onDeactivate }: SuppliersTableProps) {
  return (
    <DataTable
      columns={columns(onEdit, onDeactivate)}
      data={suppliers}
      loading={loading}
      rowKey={(s) => s.id}
      emptyIcon={<Truck size={32} className="text-muted-foreground/40" />}
      emptyText="No hay proveedores registrados"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}