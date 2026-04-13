import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
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
              <DropdownMenuItem onClick={() => onConfirm("deactivate", cat)}>Desactivar</DropdownMenuItem>
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
  )
}