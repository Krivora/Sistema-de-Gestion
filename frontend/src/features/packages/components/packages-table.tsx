import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Boxes, MoreHorizontal } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { formatCurrency } from "@/lib/utils"
import { packageUnitCount, type Package } from "@/lib/api/packages"
import { KIND_LABEL, STATUS_LABEL, STATUS_VARIANT } from "../constants"
import type { ConfirmType } from "../hooks/use-packages"

interface PackagesTableProps {
  packages: Package[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (pkg: Package) => void
  onActivate: (pkg: Package) => void
  onConfirm: (type: ConfirmType, pkg: Package) => void
}

/** Qué lleva el paquete, en una línea legible para quien vende. */
function contentSummary(pkg: Package): string {
  if (pkg.kind === "fixed") {
    return `${packageUnitCount(pkg)} pieza(s) · ${pkg.items.length} producto(s)`
  }

  const scope =
    pkg.selection_scope === "category" ? `de ${pkg.category_name ?? "una categoría"}`
      : pkg.selection_scope === "list" ? `de ${pkg.items.length} producto(s)`
        : "de cualquier producto"

  return `${pkg.item_count ?? 0} pieza(s) a elegir ${scope}`
}

function unitPriceLabel(pkg: Package): string {
  const units = packageUnitCount(pkg)
  return units > 0 ? `${formatCurrency(pkg.price / units)} c/u` : "—"
}

function PackageActions({
  pkg, onEdit, onActivate, onConfirm,
}: {
  pkg: Package
  onEdit: (p: Package) => void
  onActivate: (p: Package) => void
  onConfirm: (t: ConfirmType, p: Package) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
        <MoreHorizontal size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(pkg)}>Editar</DropdownMenuItem>
        <DropdownMenuSeparator />
        {pkg.status === "active" && (
          <DropdownMenuItem onClick={() => onConfirm("deactivate", pkg)} variant="destructive">
            Desactivar
          </DropdownMenuItem>
        )}
        {pkg.status === "inactive" && (
          <>
            <DropdownMenuItem onClick={() => onActivate(pkg)}>Activar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConfirm("delete", pkg)} variant="destructive">
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ────────────────────────────────────────────────
   Card móvil
──────────────────────────────── */
function PackageCard({
  pkg, onEdit, onActivate, onConfirm,
}: {
  pkg: Package
  onEdit: (p: Package) => void
  onActivate: (p: Package) => void
  onConfirm: (t: ConfirmType, p: Package) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Boxes size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{pkg.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{pkg.code}</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[pkg.status]}>{STATUS_LABEL[pkg.status]}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">{KIND_LABEL[pkg.kind]}</Badge>
        <span className="text-xs text-muted-foreground truncate">{contentSummary(pkg)}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div>
          <p className="text-sm font-semibold">{formatCurrency(pkg.price)}</p>
          <p className="text-[11px] text-muted-foreground">{unitPriceLabel(pkg)}</p>
        </div>
        <PackageActions pkg={pkg} onEdit={onEdit} onActivate={onActivate} onConfirm={onConfirm} />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded w-full" />
      <div className="flex justify-between pt-2 border-t">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
   Columnas
──────────────────────────────── */
const columns = (
  onEdit: (pkg: Package) => void,
  onActivate: (pkg: Package) => void,
  onConfirm: (type: ConfirmType, pkg: Package) => void
): ColumnDef<Package>[] => [
  {
    key: "name",
    header: "Paquete",
    width: "28%",
    cell: (pkg) => (
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Boxes size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{pkg.name}</p>
          <p className="text-xs font-mono text-muted-foreground">{pkg.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: "kind",
    header: "Tipo",
    width: 120,
    cell: (pkg) => <Badge variant="secondary">{KIND_LABEL[pkg.kind]}</Badge>,
  },
  {
    key: "content",
    header: "Contenido",
    width: "30%",
    className: "px-4 py-3 text-muted-foreground overflow-hidden",
    cell: (pkg) => <span className="truncate block">{contentSummary(pkg)}</span>,
  },
  {
    key: "price",
    header: "Precio",
    width: 140,
    cell: (pkg) => (
      <div className="whitespace-nowrap">
        <p className="font-semibold">{formatCurrency(pkg.price)}</p>
        <p className="text-[11px] text-muted-foreground">{unitPriceLabel(pkg)}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Estado",
    width: 100,
    cell: (pkg) => <Badge variant={STATUS_VARIANT[pkg.status]}>{STATUS_LABEL[pkg.status]}</Badge>,
  },
  {
    key: "actions",
    header: "",
    width: 48,
    cell: (pkg) => (
      <PackageActions pkg={pkg} onEdit={onEdit} onActivate={onActivate} onConfirm={onConfirm} />
    ),
  },
]

export function PackagesTable({
  packages, loading, hasActiveFilters, onEdit, onActivate, onConfirm,
}: PackagesTableProps) {
  return (
    <>
      {/* Vista móvil */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <Boxes size={32} className="text-muted-foreground/40" />
            <p className="text-sm">
              {hasActiveFilters ? "Sin resultados para tu búsqueda" : "No hay paquetes registrados"}
            </p>
          </div>
        ) : (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
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
          data={packages}
          loading={loading}
          rowKey={(p) => p.id}
          emptyIcon={<Boxes size={32} className="text-muted-foreground/40" />}
          emptyText="No hay paquetes registrados"
          emptyFilterText="Sin resultados para tu búsqueda"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}
