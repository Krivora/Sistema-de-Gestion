// features/categories/constants.ts
import type { Category } from "@/lib/api/categories"

export const STATUS_LABEL: Record<Category["status"], string> = {
  active: "Activo", inactive: "Inactivo", deleted: "Eliminado",
}
export const STATUS_VARIANT: Record<Category["status"], "default" | "secondary" | "destructive"> = {
  active: "default", inactive: "secondary", deleted: "destructive",
}