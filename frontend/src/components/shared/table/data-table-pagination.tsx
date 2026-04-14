"use client"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

interface DataTablePaginationProps {
    page: number
    totalPages: number
    pageSize: number
    filteredCount: number
    totalCount: number
    entityLabel?: string
    onPageChange: (p: number) => void
    onPageSizeChange: (n: number) => void
}

export function DataTablePagination({
    page,
    totalPages,
    pageSize,
    filteredCount,
    totalCount,
    entityLabel = "registro",
    onPageChange,
    onPageSizeChange,
}: DataTablePaginationProps) {
    const isMobile = useMediaQuery("(max-width: 640px)")
    const plural = filteredCount !== 1

    const entityText =
        filteredCount === totalCount
            ? `${totalCount} ${entityLabel}${plural ? "s" : ""}`
            : `${filteredCount} de ${totalCount} ${entityLabel}s`

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            {/* Información y selector */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 text-muted-foreground">
                {!isMobile && (
                    <>
                        <span>{entityText}</span>
                        <span className="hidden sm:inline text-border">|</span>
                    </>
                )}

                <div className="flex items-center gap-2">
                    {!isMobile && <span>Mostrar</span>}
                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => onPageSizeChange(Number(v))}
                    >
                        <SelectTrigger className="h-8 w-17.5">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!isMobile && <span>por página</span>}
                </div>
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
                <span className="text-muted-foreground text-xs sm:text-sm">
                    Página {page} de {totalPages}
                </span>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft size={14} />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                            onPageChange(Math.min(totalPages, page + 1))
                        }
                        disabled={page === totalPages}
                        aria-label="Página siguiente"
                    >
                        <ChevronRight size={14} />
                    </Button>
                </div>
            </div>

            {/* Resumen en móviles */}
            {isMobile && (
                <div className="text-xs text-muted-foreground text-center border-t pt-2">
                    {entityText}
                </div>
            )}
        </div>
    )
}