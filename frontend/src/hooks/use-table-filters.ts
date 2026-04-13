import { useState, useEffect, useMemo } from "react"

interface UseTableFiltersOptions<T> {
  data: T[]
  filterFn: (item: T, search: string) => boolean
  defaultPageSize?: number
  extraDeps?: unknown[]
}

export function useTableFilters<T>({
  data, filterFn, defaultPageSize = 10, extraDeps = [],
}: UseTableFiltersOptions<T>) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  useEffect(() => { setPage(1) }, [search, pageSize, ...extraDeps])

  const filtered = useMemo(
    () => data.filter((item) => filterFn(item, search)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, search, ...extraDeps]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return {
    search, setSearch,
    page, setPage,
    pageSize, setPageSize,
    filtered, paginated, totalPages,
  }
}