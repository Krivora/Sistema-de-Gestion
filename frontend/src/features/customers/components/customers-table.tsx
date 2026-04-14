import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Customer } from "@/lib/api/customers"

interface CustomersTableProps {
  customers: Customer[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (c: Customer) => void
  onConfirm: (c: Customer, action: "deactivate" | "delete") => void
  onActivate: (c: Customer) => void
}

const columns = (onEdit: (c: Customer) => void,
  onConfirm: (c: Customer, action: "deactivate" | "delete") => void,
  onActivate: (c: Customer) => void): ColumnDef<Customer>[] => [
    {
      key: "name", header: "Cliente", width: "25%",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {c.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium truncate">{c.name}</span>
        </div>
      ),
    },
    {
      key: "phone", header: "Teléfono", width: 130,
      cell: (c) => <span className="text-muted-foreground">{c.phone ?? "—"}</span>,
    },
    {
      key: "email", header: "Email", width: "22%",
      cell: (c) => <span className="text-muted-foreground truncate block">{c.email ?? "—"}</span>,
    },
    {
      key: "address", header: "Dirección", width: "25%",
      className: "px-4 py-3 text-muted-foreground overflow-hidden",
      cell: (c) => <span className="truncate block">{c.address ?? "—"}</span>,
    },
    {
      key: "status", header: "Estado", width: 100,
      cell: (c) => (
        <Badge variant={c.is_active ? "default" : "secondary"}>
          {c.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "created_at", header: "Registrado", width: 120,
      cell: (c) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(c.created_at)}</span>,
    },
    {
      key: "actions", header: "", width: 48,
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(c)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            {c.is_active
              ? <DropdownMenuItem onClick={() => onConfirm(c, "deactivate")} variant="destructive">Desactivar</DropdownMenuItem>
              : <>
                <DropdownMenuItem onClick={() => onActivate(c)}>Activar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onConfirm(c, "delete")} variant="destructive">Eliminar</DropdownMenuItem>
              </>
            }
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

export function CustomersTable({ customers, loading, hasActiveFilters, onEdit, onConfirm, onActivate }: CustomersTableProps) {
  return (
    <DataTable
      columns={columns(onEdit, onConfirm, onActivate)}
      data={customers}
      loading={loading}
      rowKey={(c) => c.id}
      emptyIcon={<UserCircle size={32} className="text-muted-foreground/40" />}
      emptyText="No hay clientes registrados"
      emptyFilterText="Sin resultados para tu búsqueda"
      hasActiveFilters={hasActiveFilters}
    />
  )
}