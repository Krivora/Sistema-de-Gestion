import { useEffect } from "react"
import { sileo } from "sileo"
import { transfersApi, type Transfer } from "@/lib/api/transfers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useTransfers() {
  const transfers = useEntity<Transfer>("transfers")

  useEffect(() => {
    transfers.load(transfersApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: transfers.data,
      filterFn: (t, q) => {
        const s = q.toLowerCase()
        return (
          t.doc_no.toLowerCase().includes(s) ||
          t.from_branch_name.toLowerCase().includes(s) ||
          t.to_branch_name.toLowerCase().includes(s) ||
          t.user_name.toLowerCase().includes(s)
        )
      },
    })

  return {
    transfers: transfers.data,
    loading: transfers.loading,
    filtered, paginated, hasActiveFilters: !!search,
    search, setSearch,
    page, setPage, pageSize, setPageSize, totalPages,
    reload: () => transfers.load(transfersApi.list, true),
  }
}