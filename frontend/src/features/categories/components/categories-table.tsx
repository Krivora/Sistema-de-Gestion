import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tag, MoreHorizontal } from "lucide-react"
import { DataTable, type ColumnDef } from "@/components/shared/table/data-table"
import { formatDate } from "@/lib/utils"
import { STATUS_LABEL, STATUS_VARIANT } from "../constants"
import type { Category } from "@/lib/api/categories"
import type { ConfirmType } from "../hooks/use-categories"

interface CategoriesTableProps {
  categories: Category[]
  loading: boolean
  hasActiveFilters: boolean
  onEdit: (cat: Category) => void
  onActivate: (cat: Category) => void
  onConfirm: (type: ConfirmType, cat: Category) => void
}

function CategoryCard({ cat, onEdit, onActivate, onConfirm }: {
  cat: Category
  onEdit: (c: Category) => void
  onActivate: (c: Category) => void
  onConfirm: (t: ConfirmType, c: Category) => void
}) {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Tag size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{cat.name}</p>
            <p className="text-xs font-mono text-muted-foreground">{cat.code}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8 shrink-0"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(cat)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            {cat.status === "active" && (
              <DropdownMenuItem onClick={() => onConfirm("deactivate", cat)} variant="destructive">Desactivar</DropdownMenuItem>
            )}
            {cat.status === "inactive" && (
              <>
                <DropdownMenuItem onClick={() => onActivate(cat)}>Activar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfirm("delete", cat)} variant="destructive">Eliminar</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {cat.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t">
        <Badge variant={STATUS_VARIANT[cat.status]}>{STATUS_LABEL[cat.status]}</Badge>
        <span className="text-xs text-muted-foreground">{formatDate(cat.created_at)}</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-muted rounded w-full" />
      <div className="flex justify-between pt-1 border-t">
        <div className="h-5 bg-muted rounded w-16" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    </div>
  )
}

export function CategoriesTable({
  categories, loading, hasActiveFilters, onEdit, onActivate, onConfirm,
}: CategoriesTableProps) {
  const columns: ColumnDef<Category>[] = [
    {
      key: "name", header: "Categoría", width: "30%",
      cell: (cat) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Tag size={14} className="text-primary" />
          </div>
          <span className="font-medium truncate">{cat.name}</span>
        </div>
      ),
    },
    {
      key: "code", header: "Código", width: 120,
      cell: (cat) => <span className="font-mono text-xs text-muted-foreground">{cat.code}</span>,
    },
    {
      key: "description", header: "Descripción", width: "35%",
      className: "px-4 py-3 text-muted-foreground overflow-hidden",
      cell: (cat) => <span className="truncate block">{cat.description ?? "—"}</span>,
    },
    {
      key: "status", header: "Estado", width: 100,
      cell: (cat) => <Badge variant={STATUS_VARIANT[cat.status]}>{STATUS_LABEL[cat.status]}</Badge>,
    },
    {
      key: "created_at", header: "Creada", width: 120,
      cell: (cat) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(cat.created_at)}</span>,
    },
    {
      key: "actions", header: "", width: 48,
      cell: (cat) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8"}>
            <MoreHorizontal size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(cat)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            {cat.status === "active" && (
              <DropdownMenuItem onClick={() => onConfirm("deactivate", cat)} variant="destructive">Desactivar</DropdownMenuItem>
            )}
            {cat.status === "inactive" && (
              <>
                <DropdownMenuItem onClick={() => onActivate(cat)}>Activar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfirm("delete", cat)} variant="destructive">Eliminar</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      {/* Mobile: cards */}
      <div className="sm:hidden space-y-3">
        {loading
          ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          : categories.length === 0
            ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <Tag size={32} className="text-muted-foreground/40" />
                <p className="text-sm">
                  {hasActiveFilters ? "Sin resultados para tu búsqueda" : "No hay categorías registradas"}
                </p>
              </div>
            )
            : categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                onEdit={onEdit}
                onActivate={onActivate}
                onConfirm={onConfirm}
              />
            ))
        }
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block">
        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          rowKey={(c) => c.id}
          emptyIcon={<Tag size={32} className="text-muted-foreground/40" />}
          emptyText="No hay categorías registradas"
          emptyFilterText="Sin resultados para tu búsqueda"
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </>
  )
}