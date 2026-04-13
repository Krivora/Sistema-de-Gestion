import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { usersApi, type User } from "@/lib/api/users"
import { getApiError } from "@/lib/input-helpers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export function useUsers() {
  const users = useEntity<User>("users")
  const [filterStatus, setFilterStatus] = useState<"all" | User["status"]>("all")

  useEffect(() => {
    users.load(() => usersApi.list())
  }, [])

  const { search, setSearch, page, setPage, pageSize, setPageSize, filtered, paginated, totalPages } =
    useTableFilters({
      data: users.data,
      filterFn: (u, q) => {
        const s = q.toLowerCase()
        const matchSearch =
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.role_name.toLowerCase().includes(s)
        const matchStatus = filterStatus === "all" || u.status === filterStatus
        return matchSearch && matchStatus
      },
    })

  useEffect(() => { setPage(1) }, [filterStatus])

  const activeCount = users.data.filter((u) => u.status === "active").length
  const hasActiveFilters = !!(search || filterStatus !== "all")

  async function handleDeactivate(user: User) {
    users.optimisticUpdate(user.id, { status: "inactive" })
    try {
      await usersApi.deactivate(user.id)
      sileo.success({ title: `"${user.name}" desactivado` })
      users.load(usersApi.list, true)
    } catch (err) {
      users.load(usersApi.list, true)
      sileo.error({ title: getApiError(err, "Error al desactivar usuario") })
    }
  }

  async function handleDelete(user: User) {
    users.optimisticRemove(user.id)
    try {
      await usersApi.delete(user.id)
      sileo.success({ title: `"${user.name}" eliminado` })
      users.load(usersApi.list, true)
    } catch (err) {
      users.load(usersApi.list, true)
      sileo.error({ title: getApiError(err, "Error al eliminar usuario") })
    }
  }

  return {
    users: users.data,
    loading: users.loading,
    filtered, paginated, activeCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    page, setPage, pageSize, setPageSize, totalPages,
    handleDeactivate, handleDelete,
    reload: () => users.load(usersApi.list, true),
  }
}