import { useState, useEffect, useCallback, useMemo } from "react"
import { sileo } from "sileo"
import { activitiesApi, type Activity, type ActivitiesResponse } from "@/lib/api/activities"

export const ACTION_LABELS: Record<string, string> = {
  CREATE:     "Crear",
  UPDATE:     "Actualizar",
  DELETE:     "Eliminar",
  ACTIVATE:   "Activar",
  DEACTIVATE: "Desactivar",
  LOGIN:      "Iniciar sesión",
  REGISTER:   "Registro",
}

export const CATEGORY_LABELS: Record<string, string> = {
  auth:          "Autenticación",
  customer:      "Clientes",
  category:      "Categorías",
  branch:        "Sucursales",
  product:       "Productos",
  sale:          "Ventas",
  purchase:      "Compras",
  transfer:      "Transferencias",
  adjustment:    "Ajustes",
  supplier:      "Proveedores",
  user:          "Usuarios",
  inventory:     "Inventario",
}

export const SEVERITY_LABELS: Record<string, string> = {
  info:     "Info",
  warning:  "Advertencia",
  error:    "Error",
  critical: "Crítico",
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]
const DEFAULT_PAGE_SIZE = 25

export function useActivities() {
  const [response, setResponse]       = useState<ActivitiesResponse>({ data: [], total: 0, page: 1, limit: DEFAULT_PAGE_SIZE })
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [filterAction,   setFilterAction]   = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus,   setFilterStatus]   = useState("all")
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const load = useCallback(async (
    p: number, size: number,
    action: string, category: string, severity: string, status: string,
  ) => {
    setLoading(true)
    try {
      const res = await activitiesApi.list({
        action:   action   !== "all" ? action   : undefined,
        category: category !== "all" ? category : undefined,
        severity: severity !== "all" ? severity : undefined,
        status:   status   !== "all" ? status   : undefined,
        page: p,
        limit: size,
      })
      setResponse(res)
    } catch {
      sileo.error({ title: "Error al cargar actividad" })
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset a página 1 cuando cambia cualquier filtro o pageSize
  useEffect(() => {
    setPage(1)
    load(1, pageSize, filterAction, filterCategory, filterSeverity, filterStatus)
  }, [filterAction, filterCategory, filterSeverity, filterStatus, pageSize])

  // Carga cuando el usuario cambia de página manualmente
  useEffect(() => {
    load(page, pageSize, filterAction, filterCategory, filterSeverity, filterStatus)
  }, [page])

  // Búsqueda local sobre la página actual
  const filtered = useMemo(() => {
    if (!search.trim()) return response.data
    const q = search.toLowerCase()
    return response.data.filter((a) =>
      a.description?.toLowerCase().includes(q) ||
      a.user_name?.toLowerCase().includes(q)   ||
      a.action?.toLowerCase().includes(q)       ||
      a.ref_table?.toLowerCase().includes(q)
    )
  }, [response.data, search])

  const hasActiveFilters = !!(
    search ||
    filterAction   !== "all" ||
    filterCategory !== "all" ||
    filterSeverity !== "all" ||
    filterStatus   !== "all"
  )

  const totalPages = Math.max(1, Math.ceil(response.total / pageSize))

  return {
    items: filtered,
    loading,
    total: response.total,
    search,        setSearch,
    filterAction,  setFilterAction,
    filterCategory,setFilterCategory,
    filterSeverity,setFilterSeverity,
    filterStatus,  setFilterStatus,
    page,          setPage,
    pageSize,      setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    totalPages,
    hasActiveFilters,
    reload: () => load(page, pageSize, filterAction, filterCategory, filterSeverity, filterStatus),
  }
}