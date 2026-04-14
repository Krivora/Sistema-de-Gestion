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
import { Users, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { User } from "@/lib/api/users"
import type { UserConfirmType } from "@/features/users/hooks/use-users"

/* ────────────────────────────────────────────────
   Configuración de estados
──────────────────────────────── */
const STATUS_LABEL: Record<User["status"], string> = {
  active: "Activo",
  inactive: "Inactivo",
  deleted: "Eliminado",
}

const STATUS_VARIANT: Record<
  User["status"],
  "default" | "secondary" | "destructive"
> = {
  active: "default",
  inactive: "secondary",
  deleted: "destructive",
}

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface UsersTableProps {
  users: User[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (u: User) => void
  onActivate: (u: User) => void
  onConfirm: (type: UserConfirmType, u: User) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function UserCard({
  user,
  onEdit,
  onActivate,
  onConfirm,
}: {
  user: User
  onEdit: (u: User) => void
  onActivate: (u: User) => void
  onConfirm: (type: UserConfirmType, u: User) => void
}) {
  const isActive = user.status === "active"

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>

        <Badge variant={STATUS_VARIANT[user.status]}>
          {STATUS_LABEL[user.status]}
        </Badge>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Rol</p>
          <p className="truncate">{user.role_name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Creado</p>
          <p>{formatDate(user.created_at)}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end pt-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              buttonVariants({ variant: "ghost", size: "icon" }) +
              " h-8 w-8"
            }
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {isActive ? (
              <>
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm("deactivate", user)}
                  variant="destructive"
                >
                  Desactivar
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onActivate(user)}>
                  Activar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm("delete", user)}
                  variant="destructive"
                >
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Skeleton móvil
──────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded" />
      </div>

      <div className="flex justify-end pt-2 border-t">
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Columnas de la tabla
──────────────────────────────── */
const columns = (
  onEdit: (u: User) => void,
  onActivate: (u: User) => void,
  onConfirm: (type: UserConfirmType, u: User) => void,
): ColumnDef<User>[] => [
  {
    key: "name",
    header: "Usuario",
    width: "25%",
    cell: (u) => <span className="font-medium">{u.name}</span>,
  },
  {
    key: "email",
    header: "Email",
    width: "25%",
    cell: (u) => (
      <span className="text-muted-foreground truncate block">
        {u.email}
      </span>
    ),
  },
  {
    key: "role_name",
    header: "Rol",
    width: "15%",
    cell: (u) => (
      <span className="text-muted-foreground">{u.role_name}</span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 100,
    cell: (u) => (
      <Badge variant={STATUS_VARIANT[u.status]}>
        {STATUS_LABEL[u.status]}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Creado",
    width: 120,
    cell: (u) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(u.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (u) => {
      const isActive = u.status === "active"
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              buttonVariants({ variant: "ghost", size: "icon" }) +
              " h-8 w-8"
            }
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isActive ? (
              <>
                <DropdownMenuItem onClick={() => onEdit(u)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm("deactivate", u)}
                  variant="destructive"
                >
                  Desactivar
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onActivate(u)}>
                  Activar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm("delete", u)}
                  variant="destructive"
                >
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

/* ────────────────────────────────────────────────
   Componente principal
──────────────────────────────── */
export function UsersTable({
  users,
  loading,
  hasActiveFilters,
  onEdit,
  onActivate,
  onConfirm,
}: UsersTableProps) {
  return (
    <>
      {/* Vista móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Users
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay usuarios registrados"}
            </p>
          </div>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={onEdit}
              onActivate={onActivate}
              onConfirm={onConfirm}
            />
          ))
        )}
      </div>

      {/* Vista escritorio */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(onEdit, onActivate, onConfirm)}
          data={users}
          loading={loading}
          rowKey={(u) => u.id}
          emptyIcon={
            <Users
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay usuarios registrados"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}