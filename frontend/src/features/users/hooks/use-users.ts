import { useState, useEffect } from "react"
import { sileo } from "sileo"
import { usersApi, type User } from "@/lib/api/users"
import { getApiError } from "@/lib/input-helpers"
import { useEntity } from "@/store/entity.store"
import { useTableFilters } from "@/hooks/use-table-filters"

export type UserConfirmType = "deactivate" | "delete"

export function useUsers() {
  const users = useEntity<User>("users")
  const [filterStatus, setFilterStatus] = useState<"all" | User["status"]>("all")

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; type: UserConfirmType; user: User | null
  }>({ open: false, type: "deactivate", user: null })

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
      extraDeps: [filterStatus],
    })

  const activeCount = users.data.filter((u) => u.status === "active").length
  const hasActiveFilters = !!(search || filterStatus !== "all")

  async function handleActivate(user: User) {
    users.optimisticUpdate(user.id, { status: "active" })
    try {
      await usersApi.activate(user.id)
      sileo.success({ title: `"${user.name}" activado` })
      users.load(usersApi.list, true)
    } catch (err) {
      users.load(usersApi.list, true)
      sileo.error({ title: getApiError(err, "Error al activar usuario") })
    }
  }

  function openConfirm(type: UserConfirmType, user: User) {
    setConfirmDialog({ open: true, type, user })
  }

  async function handleConfirm() {
    const { type, user } = confirmDialog
    if (!user) return
    setConfirmDialog((d) => ({ ...d, open: false }))

    if (type === "deactivate") users.optimisticUpdate(user.id, { status: "inactive" })
    else                       users.optimisticRemove(user.id)

    try {
      if (type === "deactivate") {
        await usersApi.deactivate(user.id)
        sileo.success({ title: `"${user.name}" desactivado` })
      } else {
        await usersApi.delete(user.id)
        sileo.success({ title: `"${user.name}" eliminado` })
      }
      users.load(usersApi.list, true)
    } catch (err) {
      users.load(usersApi.list, true)
      sileo.error({ title: getApiError(err, type === "deactivate" ? "Error al desactivar" : "Error al eliminar") })
    }
  }

  return {
    users: users.data,
    loading: users.loading,
    filtered, paginated, activeCount, hasActiveFilters,
    search, setSearch,
    filterStatus, setFilterStatus,
    page, setPage, pageSize, setPageSize, totalPages,
    handleActivate, openConfirm, handleConfirm,
    reload: () => users.load(usersApi.list, true),
    confirmDialog, setConfirmDialog,
  }
}