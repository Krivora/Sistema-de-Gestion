import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { User } from "@/lib/api/users"

const STATUS_LABEL: Record<User["status"], string> = {
  active: "Activo", inactive: "Inactivo", deleted: "Eliminado",
}
const STATUS_VARIANT: Record<User["status"], "default" | "secondary" | "destructive"> = {
  active: "default", inactive: "secondary", deleted: "destructive",
}

interface UsersTableProps {
  users: User[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (u: User) => void
  onDeactivate: (u: User) => void
  onDelete: (u: User) => void
}

const columns = (
  onEdit: (u: User) => void,
  onDeactivate: (u: User) => void,
  onDelete: (u: User) => void,
): ColumnDef<User>[] => [
  {
    key: "name", header: "Usuario", width: "25%",
    cell: (u) => <span className="font-medium">{u.name}</span>,
  },
  {
    key: "email", header: "Email", width: "25%",
    cell: (u) => <span className="text-muted-foreground truncate block">{u.email}</span>,
  },
  {
    key: "role_name", header: "Rol", width: "15%",
    cell: (u) => <span className="text-muted-foreground">{u.role_name}</span>,
  },
  {
    key: "status", header: "Estado", width: 100,
    cell: (u) => <Badge variant={STATUS_VARIANT[u.status]}>{STATUS_LABEL[u.status]}</Badge>,
  },
  {
    key: "created_at", header: "Creado", width: 120,
    cell: (u) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</span>,
  },
  {
    key: "actions", header: "", width: 48,
    cell: (u) => (
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(u)}>Editar</DropdownMenuItem>
          <DropdownMenuSeparator />
          {u.status === "active" && (
            <DropdownMenuItem onClick={() => onDeactivate(u)}>Desactivar</DropdownMenuItem>
          )}
          {u.status === "inactive" && (
            <DropdownMenuItem onClick={() => onDelete(u)} variant="destructive">Eliminar</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function UsersTable({ users, loading, hasActiveFilters, onEdit, onDeactivate, onDelete }: UsersTableProps) {
  return (
    <DataTable
      columns={columns(onEdit, onDeactivate, onDelete)}
      data={users}
      loading={loading}
      rowKey={(u) => u.id}
      emptyIcon={<Users size={32} className="text-muted-foreground/40" />}
      emptyText="No hay usuarios registrados"
      emptyFilterText="Sin resultados para los filtros aplicados"
      hasActiveFilters={hasActiveFilters}
    />
  )
}