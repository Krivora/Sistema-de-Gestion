// features/packages/constants.ts
import type { Package } from "@/lib/api/packages"

export const STATUS_LABEL: Record<Package["status"], string> = {
  active: "Activo", inactive: "Inactivo", deleted: "Eliminado",
}
export const STATUS_VARIANT: Record<Package["status"], "default" | "secondary" | "destructive"> = {
  active: "default", inactive: "secondary", deleted: "destructive",
}

export const KIND_LABEL: Record<Package["kind"], string> = {
  fixed: "Predefinido", flexible: "Armable",
}
