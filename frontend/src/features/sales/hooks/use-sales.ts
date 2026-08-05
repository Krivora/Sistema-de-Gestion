import { useState, useEffect, useCallback, useRef } from "react"
import { sileo } from "sileo"
import { salesApi, type Sale } from "@/lib/api/sales"
import { branchesApi, type Branch } from "@/lib/api/branches"
import { useEntity } from "@/store/entity.store"
import { useAuthStore } from "@/store/auth.store"
import { generateSaleReceipt } from "@/lib/pdf/sale-receipt"
import { getApiError } from "@/lib/input-helpers"

const SEARCH_DEBOUNCE_MS = 350

/**
 * Ventas con paginación, búsqueda y filtros resueltos en el servidor.
 *
 * Antes se traían 500 registros y se filtraba en memoria: pasadas esas 500 el
 * usuario dejaba de ver ventas sin ningún aviso, y la búsqueda solo encontraba
 * lo que ya estuviera cargado.
 */
export function useSales() {
  const user = useAuthStore((s) => s.user)
  const branchesEntity = useEntity<Branch>("branches")

  const [sales, setSales] = useState<Sale[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | Sale["status"]>("all")
  const [filterBranch, setFilterBranch] = useState<"all" | string>("all")
  const [filterPayment, setFilterPayment] = useState<"all" | string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => { branchesEntity.load(branchesApi.list) }, [])

  // No dispares una consulta por cada tecla
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search])

  // Cualquier cambio de filtro vuelve a la primera página: quedarse en la 7 de
  // un listado que ahora tiene 2 páginas mostraría un vacío confuso.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterStatus, filterBranch, filterPayment, dateFrom, dateTo, pageSize])

  // Descarta respuestas viejas que lleguen fuera de orden
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await salesApi.list({
        q: debouncedSearch || undefined,
        status: filterStatus === "all" ? undefined : filterStatus,
        branch_id: filterBranch === "all" ? undefined : filterBranch,
        date_from: dateFrom || undefined,
        date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
        page,
        page_size: pageSize,
      })
      if (id !== requestId.current) return
      setSales(res.data)
      setTotal(res.total)
    } catch (err) {
      if (id === requestId.current) sileo.error({ title: getApiError(err, "Error al cargar ventas") })
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [debouncedSearch, filterStatus, filterBranch, filterPayment, dateFrom, dateTo, page, pageSize])

  useEffect(() => { load() }, [load])

  // El método de pago no viaja al API todavía: se afina sobre la página actual
  const visible = filterPayment === "all"
    ? sales
    : sales.filter((s) => s.payment_method === filterPayment)

  const hasActiveFilters = !!(
    search || filterStatus !== "all" || filterBranch !== "all" ||
    filterPayment !== "all" || dateFrom || dateTo
  )
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function clearFilters() {
    setSearch("")
    setFilterStatus("all")
    setFilterBranch("all")
    setFilterPayment("all")
    setDateFrom("")
    setDateTo("")
  }

  async function handlePost(id: number) {
    try {
      await salesApi.post(id)
      sileo.success({ title: "Venta publicada correctamente" })
      await load()
    } catch (err) {
      sileo.error({ title: getApiError(err, "Error al publicar venta") })
    }
  }

  async function handleCancel(id: number, reason?: string) {
    try {
      const res = await salesApi.cancel(id, reason)
      sileo.success({
        title: "Venta cancelada",
        description: res.refund_due > 0
          ? `Regresa ${res.refund_due.toFixed(2)} al cliente en caja`
          : undefined,
      })
      await load()
    } catch (err) {
      sileo.error({ title: getApiError(err, "Error al cancelar la venta") })
    }
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
        generateSaleReceipt(await salesApi.get(sale.id), opts)
      } catch {
        sileo.error({ title: "Error al generar recibo" })
      }
    }
  }

  return {
    sales, branches: branchesEntity.data, loading,
    total, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    filterBranch, setFilterBranch,
    filterPayment, setFilterPayment,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    clearFilters,
    page, setPage, pageSize, setPageSize,
    paginated: visible, totalPages,
    handlePost, handleCancel, handleDownloadPdf,
    reload: load,
  }
}
