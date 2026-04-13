import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { salesApi, type Sale } from "@/lib/api/sales"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"
import { useAuthStore } from "@/store/auth.store"
import { generateSaleReceipt } from "@/lib/pdf/sale-receipt"

export function useSales() {
  const user = useAuthStore((s) => s.user)
  const entity = useEntity<Sale>("sales")
  const branchesEntity = useEntity<Branch>("branches")

  const [filterStatus, setFilterStatus] = useState<"all" | Sale["status"]>("all")
  const [filterBranch, setFilterBranch] = useState<"all" | string>("all")
  const [filterPayment, setFilterPayment] = useState<"all" | string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    entity.load(salesApi.list)
    branchesEntity.load(branchesApi.list)
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: entity.data,
      filterFn: (s, q) => {
        const matchSearch =
          s.doc_no.toLowerCase().includes(q.toLowerCase()) ||
          s.branch_name.toLowerCase().includes(q.toLowerCase()) ||
          s.user_name.toLowerCase().includes(q.toLowerCase()) ||
          (s.customer_name ?? "").toLowerCase().includes(q.toLowerCase())
        const matchStatus = filterStatus === "all" || s.status === filterStatus
        const matchBranch = filterBranch === "all" || String(s.branch_id) === filterBranch
        const matchPayment = filterPayment === "all" || s.payment_method === filterPayment
        const matchFrom = !dateFrom || s.created_at >= dateFrom
        const matchTo = !dateTo || s.created_at <= dateTo + "T23:59:59"
        return matchSearch && matchStatus && matchBranch && matchPayment && matchFrom && matchTo
      },
    })

  useEffect(() => { setPage(1) }, [filterStatus, filterBranch, filterPayment, dateFrom, dateTo])

  const hasActiveFilters = !!(search || filterStatus !== "all" || filterBranch !== "all" || filterPayment !== "all" || dateFrom || dateTo)
  const postedCount = entity.data.filter((s) => s.status === "posted").length

  function clearFilters() {
    setSearch("")
    setFilterStatus("all")
    setFilterBranch("all")
    setFilterPayment("all")
    setDateFrom("")
    setDateTo("")
  }

  async function handleDownloadPdf(sale: Sale) {
    const opts = {
      businessName: user?.business_name ?? sale.branch_name,
      logoUrl: user?.logo_url,
      phone: user?.phone,
      email: user?.email,
    }
    if (sale.items) {
      generateSaleReceipt(sale, opts)
    } else {
      try {
        const full = await salesApi.get(sale.id)
        generateSaleReceipt(full, opts)
      } catch {
        sileo.error({ title: "Error al generar recibo" })
      }
    }
  }

  return {
    sales: entity.data,
    branches: branchesEntity.data,
    loading: entity.loading,
    postedCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterBranch, setFilterBranch,
    filterPayment, setFilterPayment,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    filtered, paginated, totalPages,
    handleDownloadPdf,
    reload: () => entity.load(salesApi.list, true),
  }
}