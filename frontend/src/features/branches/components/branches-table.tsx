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
import { Building2, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Branch } from "@/lib/api/branches"
import type { BranchConfirmType } from "@/features/branches/hooks/use-branches"

/* ────────────────────────────────────────────────
   Tipos
──────────────────────────────── */
interface BranchesTableProps {
  branches: Branch[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (b: Branch) => void
  onActivate: (b: Branch) => void
  onConfirm: (type: BranchConfirmType, b: Branch) => void
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function BranchCard({
  branch,
  onEdit,
  onActivate,
  onConfirm,
}: {
  branch: Branch
  onEdit: (b: Branch) => void
  onActivate: (b: Branch) => void
  onConfirm: (type: BranchConfirmType, b: Branch) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {branch.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {branch.code}
            </p>
          </div>
        </div>

        <Badge variant={branch.is_active ? "default" : "secondary"}>
          {branch.is_active ? "Activa" : "Inactiva"}
        </Badge>
      </div>

      {/* Información */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Teléfono</p>
          <p className="truncate">{branch.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Creada</p>
          <p>{formatDate(branch.created_at)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">Dirección</p>
          <p className="truncate">{branch.address ?? "—"}</p>
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
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {branch.is_active ? (
              <DropdownMenuItem
                onClick={() => onConfirm("deactivate", branch)}
                variant="destructive"
              >
                Desactivar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onActivate(branch)}>
                  Activar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onConfirm("delete", branch)}
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
        <div className="h-9 w-9 rounded-lg bg-muted" />
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
  onEdit: (b: Branch) => void,
  onActivate: (b: Branch) => void,
  onConfirm: (type: BranchConfirmType, b: Branch) => void,
): ColumnDef<Branch>[] => [
  {
    key: "name",
    header: "Sucursal",
    width: "25%",
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
    key: "code",
    header: "Código",
    width: 120,
    cell: (b) => (
      <span className="font-mono text-xs text-muted-foreground">
        {b.code}
      </span>
    ),
  },
  {
    key: "phone",
    header: "Teléfono",
    width: 130,
    cell: (b) => (
      <span className="text-muted-foreground">
        {b.phone ?? "—"}
      </span>
    ),
  },
  {
    key: "address",
    header: "Dirección",
    width: "30%",
    className: "px-4 py-3 text-muted-foreground overflow-hidden",
    cell: (b) => (
      <span className="truncate block">
        {b.address ?? "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 100,
    cell: (b) => (
      <Badge variant={b.is_active ? "default" : "secondary"}>
        {b.is_active ? "Activa" : "Inactiva"}
      </Badge>
    ),
  },
  {
    key: "created_at",
    header: "Creada",
    width: 120,
    cell: (b) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDate(b.created_at)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (b) => (
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
          <DropdownMenuItem onClick={() => onEdit(b)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {b.is_active ? (
            <DropdownMenuItem
              onClick={() => onConfirm("deactivate", b)}
              variant="destructive"
            >
              Desactivar
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => onActivate(b)}>
                Activar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onConfirm("delete", b)}
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
export function BranchesTable({
  branches,
  loading,
  hasActiveFilters,
  onEdit,
  onActivate,
  onConfirm,
}: BranchesTableProps) {
  return (
    <>
      {/* Vista móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Building2
              size={32}
              className="text-muted-foreground/40"
            />
            <p className="text-sm">
              {hasActiveFilters
                ? "Sin resultados para los filtros aplicados"
                : "No hay sucursales registradas"}
            </p>
          </div>
        ) : (
          branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
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
          data={branches}
          loading={loading}
          rowKey={(b) => b.id}
          emptyIcon={
            <Building2
              size={32}
              className="text-muted-foreground/40"
            />
          }
          emptyText="No hay sucursales registradas"
          emptyFilterText="Sin resultados para los filtros aplicados"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}