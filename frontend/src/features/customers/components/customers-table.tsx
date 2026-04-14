import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  UserCircle,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Customer } from "@/lib/api/customers"

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface CustomersTableProps {
  customers: Customer[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (c: Customer) => void
  onConfirm: (
    c: Customer,
    action: "deactivate" | "delete"
  ) => void
  onActivate: (c: Customer) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function CustomerCard({
  customer,
  onEdit,
  onConfirm,
  onActivate,
}: {
  customer: Customer
  onEdit: (c: Customer) => void
  onConfirm: (
    c: Customer,
    action: "deactivate" | "delete"
  ) => void
  onActivate: (c: Customer) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {customer.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {customer.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {customer.email ?? "Sin correo"}
            </p>
          </div>
        </div>

        <Badge
          variant={
            customer.is_active ? "default" : "secondary"
          }
        >
          {customer.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">
            Teléfono
          </p>
          <p className="truncate">
            {customer.phone ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">
            Registrado
          </p>
          <p>
            {formatDate(customer.created_at)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">
            Dirección
          </p>
          <p className="truncate">
            {customer.address ?? "—"}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end pt-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={
              buttonVariants({
                variant: "ghost",
                size: "icon",
              }) + " h-8 w-8"
            }
          >
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {customer.is_active ? (
              <DropdownMenuItem
                onClick={() =>
                  onConfirm(customer, "deactivate")
                }
                variant="destructive"
              >
                Desactivar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => onActivate(customer)}
                >
                  Activar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    onConfirm(customer, "delete")
                  }
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
        <div className="h-3 bg-muted rounded col-span-2" />
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
  onEdit: (c: Customer) => void,
  onConfirm: (
    c: Customer,
    action: "deactivate" | "delete"
  ) => void,
  onActivate: (c: Customer) => void
): ColumnDef<Customer>[] => [
  {
    key: "name",
    header: "Cliente",
    width: "25%",
    cell: (c) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {c.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium truncate">
          {c.name}
        </span>
      </div>
    ),
  },
  {
    key: "phone",
    header: "Teléfono",
    width: 130,
    cell: (c) => (
      <span className="text-muted-foreground">
        {c.phone ?? "—"}
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    width: "22%",
    cell: (c) => (
      <span className="text-muted-foreground truncate block">
        {c.email ?? "—"}
      </span>
    ),
  },
  {
    key: "address",
    header: "Dirección",
    width: "25%",
    className:
      "px-4 py-3 text-muted-foreground overflow-hidden",
    cell: (c) => (
      <span className="truncate block">
        {c.address ?? "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 100,
    cell: (c) => (
      <Badge
        variant={
          c.is_active ? "default" : "secondary"
        }
      >
        {c.is_active ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Registrado",
    width: 120,
    cell: (c) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(c.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (c) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={
            buttonVariants({
              variant: "ghost",
              size: "icon",
            }) + " h-8 w-8"
          }
        >
          <MoreHorizontal size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(c)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {c.is_active ? (
            <DropdownMenuItem
              onClick={() =>
                onConfirm(c, "deactivate")
              }
              variant="destructive"
            >
              Desactivar
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => onActivate(c)}
              >
                Activar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  onConfirm(c, "delete")
                }
                variant="destructive"
              >
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

/* ────────────────────────────────────────────────
   Componente principal
──────────────────────────────── */
export function CustomersTable({
  customers,
  loading,
  hasActiveFilters,
  onEdit,
  onConfirm,
  onActivate,
}: CustomersTableProps) {
  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <UserCircle
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para tu búsqueda"
                : "No hay clientes registrados"}
            </p>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={onEdit}
              onConfirm={onConfirm}
              onActivate={onActivate}
            />
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(
            onEdit,
            onConfirm,
            onActivate
          )}
          data={customers}
          loading={loading}
          rowKey={(c) => c.id}
          emptyIcon={
            <UserCircle
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay clientes registrados"
          emptyFilterText="Sin resultados para tu búsqueda"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}