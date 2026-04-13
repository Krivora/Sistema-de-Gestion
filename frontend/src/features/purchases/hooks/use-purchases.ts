import { useState, useEffect } from "react"
import { purchasesApi, type Purchase } from "@/lib/api/purchases"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function usePurchases() {
  const entity = useEntity<Purchase>("purchases")
  const branchesEntity = useEntity<Branch>("branches")

  const [filterStatus, setFilterStatus] = useState<"all" | Purchase["status"]>("all")
  const [filterBranch, setFilterBranch] = useState<"all" | string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    entity.load(purchasesApi.list)
    branchesEntity.load(branchesApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (p, q) => {
        const matchSearch =
          p.doc_no.toLowerCase().includes(q.toLowerCase()) ||
          p.branch_name.toLowerCase().includes(q.toLowerCase()) ||
          p.user_name.toLowerCase().includes(q.toLowerCase())
        const matchStatus = filterStatus === "all" || p.status === filterStatus
        const matchBranch = filterBranch === "all" || String(p.branch_id) === filterBranch
        const matchFrom = !dateFrom || p.created_at >= dateFrom
        const matchTo = !dateTo || p.created_at <= dateTo + "T23:59:59"
        return matchSearch && matchStatus && matchBranch && matchFrom && matchTo
      },
      extraDeps: [filterStatus, filterBranch, dateFrom, dateTo],
    })

  const hasActiveFilters = !!(search || filterStatus !== "all" || filterBranch !== "all" || dateFrom || dateTo)
  const postedCount = entity.data.filter((p) => p.status === "posted").length

  function clearFilters() {
    setSearch("")
    setFilterStatus("all")
    setFilterBranch("all")
    setDateFrom("")
    setDateTo("")
  }

  return {
    purchases: entity.data,
    branches: branchesEntity.data,
    loading: entity.loading,
    postedCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterBranch, setFilterBranch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    reload: () => entity.load(purchasesApi.list, true),
  }
}