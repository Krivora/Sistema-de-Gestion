import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

interface DataTablePaginationProps {
    page: number
    totalPages: number
    pageSize: number
    filteredCount: number
    totalCount: number
    entityLabel?: string // "producto", "categoría", etc.
    onPageChange: (p: number) => void
    onPageSizeChange: (n: number) => void
}

export function DataTablePagination({
    page, totalPages, pageSize,
    filteredCount, totalCount,
    entityLabel = "registro",
    onPageChange, onPageSizeChange,
}: DataTablePaginationProps) {
    const plural = filteredCount !== 1

    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
                <span>
                    {filteredCount === totalCount
                        ? `${totalCount} ${entityLabel}${plural ? "s" : ""}`
                        : `${filteredCount} de ${totalCount} ${entityLabel}s`}
                </span>
                <span className="text-border">|</span>
                <div className="flex items-center gap-2">
                    <span>Mostrar</span>
                    <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
                        <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>por página</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Página {page} de {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8"
                    onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
                    <ChevronLeft size={14} />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                    <ChevronRight size={14} />
                </Button>
            </div>
        </div>
    )
}