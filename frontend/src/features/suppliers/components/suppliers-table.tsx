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

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface SuppliersTableProps {
  suppliers: Supplier[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (s: Supplier) => void
  onConfirm: (s: Supplier, action: "deactivate" | "delete") => void
  onActivate: (s: Supplier) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function SupplierCard({
  supplier,
  onEdit,
  onConfirm,
  onActivate,
}: {
  supplier: Supplier
  onEdit: (s: Supplier) => void
  onConfirm: (s: Supplier, action: "deactivate" | "delete") => void
  onActivate: (s: Supplier) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {supplier.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {supplier.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {supplier.email ?? "Sin correo"}
            </p>
          </div>
        </div>

        <Badge variant={supplier.is_active ? "default" : "secondary"}>
          {supplier.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Teléfono</p>
          <p className="truncate">{supplier.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Registrado</p>
          <p>{formatDate(supplier.created_at)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">Dirección</p>
          <p className="truncate">{supplier.address ?? "—"}</p>
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
            <DropdownMenuItem onClick={() => onEdit(supplier)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {supplier.is_active ? (
              <DropdownMenuItem
                onClick={() => onConfirm(supplier, "deactivate")}
                variant="destructive"
              >
                Desactivar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onActivate(supplier)}>
                  Activar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm(supplier, "delete")}
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
  onEdit: (s: Supplier) => void,
  onConfirm: (s: Supplier, action: "deactivate" | "delete") => void,
  onActivate: (s: Supplier) => void,
): ColumnDef<Supplier>[] => [
  {
    key: "name",
    header: "Proveedor",
    width: "25%",
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
    key: "phone",
    header: "Teléfono",
    width: 140,
    cell: (s) => (
      <span className="text-muted-foreground">
        {s.phone ?? "—"}
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    width: "20%",
    cell: (s) => (
      <span className="text-muted-foreground truncate block">
        {s.email ?? "—"}
      </span>
    ),
  },
  {
    key: "address",
    header: "Dirección",
    width: "20%",
    cell: (s) => (
      <span className="text-muted-foreground truncate block max-w-[200px]">
        {s.address ?? "—"}
      </span>
    ),
  },
  {
    key: "is_active",
    header: "Estado",
    width: 100,
    cell: (s) => (
      <Badge variant={s.is_active ? "default" : "secondary"}>
        {s.is_active ? "Activo" : "Inactivo"}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Registrado",
    width: 120,
    cell: (s) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(s.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (s) => (
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
          <DropdownMenuItem onClick={() => onEdit(s)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {s.is_active ? (
            <DropdownMenuItem
              onClick={() => onConfirm(s, "deactivate")}
              variant="destructive"
            >
              Desactivar
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => onActivate(s)}>
                Activar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onConfirm(s, "delete")}
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
export function SuppliersTable({
  suppliers,
  loading,
  hasActiveFilters,
  onEdit,
  onConfirm,
  onActivate,
}: SuppliersTableProps) {
  return (
    <>
      {/* Vista móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Truck size={32} className="text-muted-foreground/40" />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay proveedores registrados"}
            </p>
          </div>
        ) : (
          suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={onEdit}
              onConfirm={onConfirm}
              onActivate={onActivate}
            />
          ))
        )}
      </div>

      {/* Vista escritorio */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns(onEdit, onConfirm, onActivate)}
          data={suppliers}
          loading={loading}
          rowKey={(s) => s.id}
          emptyIcon={
            <Truck size={32} className="text-muted-foreground/40" />
          }
          emptyText="No hay proveedores registrados"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}