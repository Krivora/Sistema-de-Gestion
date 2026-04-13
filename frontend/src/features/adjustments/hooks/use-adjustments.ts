import { useState, useEffect } from "react"
import { adjustmentsApi, type Adjustment } from "@/lib/api/adjustments"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useAdjustments() {
    const entity = useEntity<Adjustment>("adjustments")
    const [filterType, setFilterType] = useState<"all" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT">("all")

    useEffect(() => { entity.load(adjustmentsApi.list) }, [])

    const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
        useTableFilters({
            data: entity.data,
            filterFn: (a, s) => {
                const matchSearch =
                    a.doc_no.toLowerCase().includes(s.toLowerCase()) ||
                    a.branch_name.toLowerCase().includes(s.toLowerCase()) ||
                    a.user_name.toLowerCase().includes(s.toLowerCase())
                const matchType = filterType === "all" || a.type === filterType
                return matchSearch && matchType
            },
            defaultPageSize: 25,
        })

    useEffect(() => { setPage(1) }, [filterType])

    const hasActiveFilters = !!(search || filterType !== "all")

    function clearFilters() { setSearch(""); setFilterType("all") }

    return {
        adjustments: entity.data,
        loading: entity.loading,
        search, setSearch,
        filterType, setFilterType,
        hasActiveFilters, clearFilters,
        page, setPage, pageSize, setPageSize,
        filtered, paginated, totalPages,
        reload: () => entity.load(adjustmentsApi.list, true),
    }
}