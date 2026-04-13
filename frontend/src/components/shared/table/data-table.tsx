import type { ReactNode } from "react"

export interface ColumnDef<T> {
    key: string
    header: string
    cell: (row: T) => ReactNode
    className?: string
    width?: string | number  // ← nuevo: "200px", "15%", 120, etc.
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[]
    data: T[]
    loading?: boolean
    emptyIcon?: ReactNode
    emptyText?: string
    emptyFilterText?: string
    hasActiveFilters?: boolean
    rowKey: (row: T) => string | number
}

export function DataTable<T>({
    columns, data, loading,
    emptyIcon, emptyText, emptyFilterText,
    hasActiveFilters, rowKey,
}: DataTableProps<T>) {
    const hasWidths = columns.some((c) => c.width !== undefined)

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm" style={hasWidths ? { tableLayout: "fixed" } : undefined}>
                {hasWidths && (
                    <colgroup>
                        {columns.map((col) => (
                            <col
                                key={col.key}
                                style={{
                                    width: col.width !== undefined
                                        ? typeof col.width === "number" ? `${col.width}px` : col.width
                                        : undefined,
                                }}
                            />
                        ))}
                    </colgroup>
                )}
                <thead className="bg-muted/50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading &&
                        [...Array(5)].map((_, i) => (
                            <tr key={i} className="border-t">
                                {columns.map((col, j) => (
                                    <td key={col.key} className="px-4 py-3">
                                        <div
                                            className="h-4 bg-muted rounded animate-pulse"
                                            style={{
                                                width:
                                                    j === columns.length - 1 ? "32px" : j === 0 ? "80%" : "60%",
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    {!loading && data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    {emptyIcon}
                                    {hasActiveFilters
                                        ? emptyFilterText ?? "Sin resultados para los filtros aplicados"
                                        : emptyText ?? "No hay datos"}
                                </div>
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        data.map((row) => (
                            <tr key={rowKey(row)} className="border-t hover:bg-muted/30 transition-colors">
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={col.className ?? "px-4 py-3 overflow-hidden"}
                                    >
                                        {col.cell(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
}